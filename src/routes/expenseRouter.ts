import { Router } from "express";
import { tokenVerify } from "../services/token.service";
import { createExpense, updateExpense, deleteExpense, getExpenses, getExpense } from "../controllers/expenseController";
import { ExpenseRoute } from "../models/expense.route";
const expenseRouter = Router();

expenseRouter.post(ExpenseRoute.CREATE, tokenVerify, createExpense);
expenseRouter.put(ExpenseRoute.UPDATE, tokenVerify, updateExpense);
expenseRouter.delete(ExpenseRoute.DELETE, tokenVerify, deleteExpense);
expenseRouter.get(ExpenseRoute.GET_EXPENSES, tokenVerify,getExpenses);
expenseRouter.get(ExpenseRoute.GET_EXPENSE, tokenVerify, getExpense);

export default expenseRouter;