import { Between, Repository } from "typeorm";
import { DBConnected } from "./db.service";
import { Expense } from "../models/Expense.entity";
import { User } from "../models/User.entity";

class ExpenseService{
    private expenseRepo:null | Repository<Expense>;
    private initPromise: null | Promise<void>;

    constructor(){
        this.expenseRepo = null;
        this.initPromise = null
    }

    private async ensureInitialized(){
        if(!this.expenseRepo && !this.initPromise){
            this.initPromise = this.initialize();
        }
        await this.initPromise;
    }

    private async initialize() {
        const AppDataSource = await DBConnected();
        this.expenseRepo = AppDataSource.getRepository(Expense);

    }   


    async findExpense(id: number){
        await this.ensureInitialized();

        try {
           return this.expenseRepo!.findOneBy({id:id});

        } catch (error) {
            throw new Error(`Error finding expense in database: ${error}`);
        }
    }
//Add a new expense
    async createExpense(userId: number, expense: Partial<Expense>){
        await this.ensureInitialized();

        try {
            const user = await this.expenseRepo!.manager.findOneBy(User, {id: userId});
           
            if(!user){
                throw new Error("User not found in expenses")
            }

            const newExpense = this.expenseRepo!.create({
                ...expense,
                user,
            })

            return await this.expenseRepo!.save(newExpense);

        } catch (error) {
            throw new Error(`Error creating expense in database: ${error}`)
            
        }

    }

    //Update existing expenses
    async updateExpense(id: number, expense: Partial<Expense>){
        await this.ensureInitialized();

        try {
             await this.expenseRepo!.update(id,expense);
             return this.findExpense(id);
            
        } catch (error) {
            throw new Error(`Error updating expense in database: ${error}`);
            
        }
    }

    //Remove existing expenses
     async deleteExpense(id: number){
        await this.ensureInitialized();

        try {
            const result = await this.expenseRepo!.delete({id:id})

            return result.affected? true : false;
            
        } catch (error) {
            throw new Error(`Error deleting expense in database: ${error}`);
        }
     }   

//    Custom (to specify a start and end date of your choosing).
     async getExpensesByDateRange(userId: number, startDate: Date, endDate: Date){

        try {
            await this.ensureInitialized();
            const found = await this.expenseRepo!.find({
                where:{
                    user: {id: userId},
                    update_date: Between(startDate, endDate) 
                },
                order:{
                    update_date: 'DESC'
                }
            })
            return found;
        }
        catch(error){
            throw new Error(`Error fetching expense in database: ${error}`);
        }
    }

//    Past week
    async getExpensesPastWeek(userId: number){

        const pastWeek = new Date();
        pastWeek.setDate(pastWeek.getDate() -7);

        return this.getExpensesByDateRange(userId, pastWeek, new Date());
    }

//    Past month
    async getExpensePastMonth(userId:number){
        const pastMonth = new Date();
        pastMonth.setMonth(pastMonth.getMonth()-1);

        return this.getExpensesByDateRange(userId, pastMonth, new Date());
    }

// Get expenses for past 3 months
    async getExpensesPastThreeMonths(userId: number): Promise<Expense[]> {
        const pastThreeMonths = new Date();
        pastThreeMonths.setMonth(pastThreeMonths.getMonth() - 3);

        return this.getExpensesByDateRange(userId, pastThreeMonths, new Date());
    }
}

export default ExpenseService;