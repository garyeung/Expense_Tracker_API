import { DataSource } from "typeorm";
import { UserReq } from "../models/user.interface";
import express from "express";
import { DBConnected } from "../services/db.service";
import { UserRoute } from "../models/user.route";
import userRouter from "../routes/userRouter";
import { ExpenseRoute } from "../models/expense.route";
import expenseRouter from "../routes/expenseRouter";
import supertest from "supertest";
import { ExpenseCategory, ExpenseReq, ExpenseRes } from "../models/expense.interface";
import UserService from "../services/user.service";

/**
 * test:
 *     beforeAll:
 *          register a user and get a token
 * 
 *     1. should create expense successfully   +
 *     2. should create expense fail without description or amount    +
 *     3. should create expesne fail without authorization    +
 *     4. should update expense successfully   +
 *     5. should delete expense  successfully
 *     6. create multiple expenses then
 *           get expenses by past week
 *           get expenses by past month
 *           get expesnes by past 3 months
 *           get expesnse by custom date range
 */
describe("Expenses Router Test", () => {
    let token: string;
    let testServer: any;
    let AppDataSource: DataSource;
    let userService: UserService;
    let expenses: ExpenseRes[];
    let testExpenseId: number;
    const generateUniqueEmail = () => `tester_${Date.now()}@forexpenses.com`;

    const testExpense: ExpenseReq = {
        amount: 30,
        description: "test expense",
        category: ExpenseCategory.Health
    };
    const updateExpense: ExpenseReq = {
        amount: 40,
        description: 'update expense',
        category: ExpenseCategory.Groceries
    }

    const bulkExpensesData: ExpenseReq[] = [testExpense,updateExpense];

    let testUser: UserReq = {
        name: "Tester for expesnes",
        email: generateUniqueEmail(),
        password: "testing12345"
    };

    beforeAll(async () => {

        try {
            AppDataSource = await DBConnected();
            testServer = express();
            testServer.use(express.json());
            testServer.use(UserRoute.ROOT, userRouter); 
            testServer.use(ExpenseRoute.ROOT, expenseRouter); 
            userService = new UserService();

            const response = await supertest(testServer)
                .post(UserRoute.REGISTER_PATH)
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty("token");
            token = response.body.token;
            
        } catch (error) {
            console.error("Setup failed", error);
            throw error;
        }
        
    });

    afterAll(async () => {
        // remove all expesnes
        // remove user
        try {

            if(expenses){
                await Promise.all(
                    expenses.map(async (expense) => {
                       await supertest(testServer)
                        .delete(`${ExpenseRoute.ROOT}/${expense.id}`)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(204);
                    })
                )
            }

            await userService.deleteUser(testUser.email);
            await AppDataSource.destroy();
            console.log("All data clean!");

        } catch (error) {
            console.error('Cleanup failed:', error);
            throw error;
        }
    
    })

    test("Should create a expense successfully", async() => {
        const response = await supertest(testServer)
            .post(ExpenseRoute.CREATE_PATH)
            .send(testExpense)
            .set("Authorization", `Bearer ${token}`)
            .expect(201);

            expect(response.body).toMatchObject(testExpense);
            expect(response.body).toHaveProperty("id");
            testExpenseId = parseInt(response.body.id);
        
    })

    test(" Should fail to create expense without required fields", async () => {
        const invalidExpenses = [
                { amount: 30, category: ExpenseCategory.Electronics },
                { description: "no amount", category: ExpenseCategory.Electronics }
            ];

            for (const invalidExpense of invalidExpenses) {
                await supertest(testServer)
                    .post(ExpenseRoute.CREATE_PATH)
                    .send(invalidExpense)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(400);
            }
    })

    test("Should create expense fail without authorizaiton", async () => {

        await supertest(testServer)
            .post(ExpenseRoute.CREATE_PATH)
            .send(testExpense)
            .expect(401);
    })

    test("Should update expense successfully", async () => {
        const response = await supertest(testServer)
            .put(`${ExpenseRoute.ROOT}/${testExpenseId}`)
            .send(updateExpense)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body.id).toBe(testExpenseId);
        expect(response.body.description).not.toEqual(testExpense.description);
    })

    test("Should delete expense successfully", async () => {
        await supertest(testServer).
            delete(`${ExpenseRoute.ROOT}/${testExpenseId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(204);

        //Verify expense is deleted
        await supertest(testServer)
                .get(`${ExpenseRoute.ROOT}/${testExpenseId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
    })

    describe("Expenses Retrieval Operations", () => {

        beforeAll( async () => {
            expenses = await Promise.all(
                bulkExpensesData.map(async (expense) => {
                    const response = await supertest(testServer)
                         .post(ExpenseRoute.CREATE_PATH)
                          .send(expense)
                          .set("Authorization", `Bearer ${token}`)
                          .expect(201);
                    return response.body;
                })
            )

        })

      const periodTests = [
            { period: 'week', description: 'past week' },
            { period: 'month', description: 'past month' },
            { period: '3months', description: 'past 3 months' }
        ];

        periodTests.forEach(({ period, description }) => {
            test(`Should get expenses for ${description}`, async () => {
                const response = await supertest(testServer)
                    .get(`${ExpenseRoute.ROOT}?period=${period}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

                const retrievedExpenses = response.body as ExpenseRes[];
                expect(retrievedExpenses).toHaveLength(expenses.length);
                expect(retrievedExpenses).toEqual(
                    expect.arrayContaining(
                        expenses.map(expense => expect.objectContaining({
                            id: expense.id,
                            description: expense.description,
                            amount: expense.amount,
                            category: expense.category
                        }))
                    )
                );
            });
        });
  

        test("Should get expenses by custom date range", async () => {

            const response = await supertest(testServer)
                .get(`${ExpenseRoute.ROOT}?start=2024-10-10&end=2024-11-13`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200); 

            const rangeExpenses = response.body as ExpenseRes[];

            expect(rangeExpenses).toBeDefined();
            expect(rangeExpenses).toHaveLength(expenses.length);

            expect(rangeExpenses).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(expenses[0]),
                    expect.objectContaining(expenses[1]),
                ])
            )
        })

    })
})