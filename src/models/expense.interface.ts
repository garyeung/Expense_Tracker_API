export enum ExpenseCategory {
    Groceries = "Groceries",
    Leisure  = "Leisure",
    Electronics = "Electronics",
    Utilities = "Utilities",
    Clothing = "Clothing",
    Health =  "Health",
    Others = "Others"
}

export interface ExpenseReq {
    description: string,
    amount: number | string,
    category: ExpenseCategory
}

export interface ExpenseRes {
    id: number
    description: string,
    amount: number,
    category: ExpenseCategory

}