import { Request, Response } from "express";
import ExpenseService from "../services/expense.service";
import { ExpenseCategory, ExpenseReq, ExpenseRes } from "../models/expense.interface";
import { Expense } from "../models/Expense.entity";

const expenseTable = new ExpenseService();


export async function createExpense(request:Request, response: Response) {
    const expense: ExpenseReq | null  = request.body;   

    if(!expense?.description || !expense.amount ){
        response.status(400).json({error: "The amount and description are required"});
        return;
    }
    else if(!isExpenseCategory(expense.category)){
        expense.category = ExpenseCategory.Others;
    }

    const createExpenseData: Partial<Expense> = {
       description: expense.description,
       amount: parseInt(expense.amount.toString()),
       category: expense.category
    };

    try {
       const  createdExpense = await expenseTable.createExpense(request.user!.id, createExpenseData)
       const resExpense: ExpenseRes = {
            id: createdExpense.id,
            category: createdExpense.category,
            description: createdExpense.description ,
            amount: createdExpense.amount
       }

       response.status(201).json(resExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        response.status(500).json({ message: "Failed to create expense." });

    }
}

export async function updateExpense(request:Request, response: Response) {
    const id = parseInt(request.params.id);
    const expense: ExpenseReq | null = request.body; 

    if(!expense?.description || !expense.amount || !expense.category ){
        response.status(400).json({error: "The amount, category and description are required"});
        return;
    }

    try {
        const foundExpense = await expenseTable.findExpense(id);


        if(!foundExpense){
            response.status(404).json({
                error: "expense not found"
            })
            return;
        }

        const updatedExpense = await expenseTable.updateExpense(
            id,  
            {
                amount: parseInt(expense.amount.toString()),
                category: expense.category,
                description: expense.description
            }
        )

        if(!updatedExpense){
            throw new Error("database error");
        }
        const result: ExpenseRes = {
            id: updatedExpense.id,
            amount: updatedExpense.amount,
            category: updatedExpense.category,
            description: updatedExpense.description
        }
        response.status(200).json(result);

        
    } catch (error) {
            console.error('Error updating expense:', error);
            response.status(500).json({ message: "Failed to update expense." });
        
    }
    
}

export async function deleteExpense(request:Request, response: Response) {
    const id = parseInt(request.params.id);

    try{
        const foundExpense = await expenseTable.findExpense(id);

        if(!foundExpense){
            response.status(404).json({
                error: "expense not found"
            });
            return;
        }

        const isDeleted = await expenseTable.deleteExpense(id);

        if(!isDeleted){
            throw new Error("database error");
        }

        response.status(204).send();

    }catch(error){
        console.error('Error deleting expense:', error);
        response.status(500).json({ message: "Failed to delete expense." });

    }
    
    
}

export async function getExpense(request: Request, response:Response) {
    const id = parseInt(request.params.id);

    try {
       const found= await expenseTable.findExpense(id);

       if(!found){
            response.status(404).json({
                error: "expense not found"
            })
       }

       else{
            response.status(200).json({
                id: found.id,
                description: found.description,
                category: found.category,
                amount: found.amount,
            }as ExpenseRes)
       }
    } catch (error) {
        console.error('Error getting expense:', error);
        response.status(500).json({ message: "Failed to get expense." });
        
    }
}

export async function getExpenses(request:Request, response: Response) {
    const userId = request.user!.id;
    const {period, start, end} = request.query;

    let expenses: Expense[];
    try{
        switch(period){
            case 'week':
                expenses = await expenseTable.getExpensesPastWeek(userId);
                break;

            case 'month':
                expenses = await expenseTable.getExpensePastMonth(userId);
                break;
            case '3months':
                expenses = await expenseTable.getExpensesPastThreeMonths(userId);
                break;
            default:
                if(start && end){
                    expenses = await expenseTable.getExpensesByDateRange(userId,
                        new Date(start as string),
                        new Date(end as string)
                    )
                }
                else{
                    expenses = await expenseTable.getExpensesByDateRange(
                        userId,
                        new Date(0), // beginning of time of internet
                        new Date()   // current time
                    );
                }
        }
        const result = expenses.map((item) => {
            return {
                id: item.id,
                description: item.description,
                amount: item.amount,
                category: item.category
            } as ExpenseRes
        })

        response.json(result);
    }
    catch(error){
        console.error('Error fetching expenses list:', error);
        response.status(500).json({ message: "Failed to fetch expenses list." });

    }

}

function isExpenseCategory(value: string) {
    return Object.values(ExpenseCategory).includes(value as ExpenseCategory);
}