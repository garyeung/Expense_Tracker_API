import { DataSource } from "typeorm"
import { ExpenseCategory } from "../models/expense.interface"
import { User } from "../models/User.entity"
import { DBConnected } from "../services/db.service"
import UserService from "../services/user.service"
import { Expense } from "../models/Expense.entity"
import ExpenseService from "../services/expense.service"

/**
 * test:
 *   before
 *     register a user    +
 *   create an expense    +
 *   create an expense with non exsiting user     +
 *   update the expense       +
 *   delete expense
 *   getExpenses by week 
 *   getExpenses by month 
 *   getExpenses by 3 months
 *   getExpenses by Date range 
 *   
 *   after:
 *      remove user
 *      delete expenses 
 */
describe("Expense Service Test", () => {
    let expenseService: ExpenseService;
    let userService:UserService;
    let appDataSource:DataSource;
    let testUser: User; 
    let testExpense: Expense;
    let testExpenses: Expense[];

    let testExpenseData: Partial<Expense> = {
        description: "test expense",
        amount: 10,
        category: ExpenseCategory.Others 
    }
    let updateExpenseData: Partial<Expense> = {
        description: "update tesing",
        amount: 20,
        category: ExpenseCategory.Groceries
    } 

    let bulkExpensesData: Partial<Expense>[] = [{
        description: "test expense2",
        amount: 20 ,
        category: ExpenseCategory.Utilities
    },
    {
        description: "test expense3",
        amount: 30,
        category: ExpenseCategory.Clothing
    }]

    let testUserData: Partial<User> = {
        name: 'tester2',
        email: 'tester2@email.com',
        password: 'testing1234'
    }


      beforeAll(async () => {
        // Setup database connection
        appDataSource = await DBConnected();

        // Initialize services
        userService = new UserService();
        expenseService = new ExpenseService(); 

        // Create test user
        testUser = await userService.createUser(testUserData)


      })

      afterAll( async () => {

        try {
            if(testExpenses){
                await Promise.all(
            testExpenses.map((expense) => {
            expenseService.deleteExpense(expense.id)
            }))
            }

            if(testUser){
                await userService.deleteUser(testUser.email);

            }
            
            await appDataSource.destroy();
        } catch (error) {
            console.error('Cleanup failed:', error);
            throw error;
        }

      })

      test("Should create an expense sucessufully", async () => {

            testExpense = await  expenseService.createExpense(testUser.id, testExpenseData);

            expect(testExpense).toMatchObject({
                ...testExpenseData,
                id: expect.any(Number),
                create_date: expect.any(Date),
                update_date: expect.any(Date)

            })

      });

      test("Should fail create an expense with an non exsiting user", async () => {

           await expect(expenseService.createExpense(9999, testExpenseData)).rejects.toThrow();

      });

      test("Should update expense successfully", async () => {

         const updateExpense = await expenseService.updateExpense(testExpense.id, updateExpenseData);

         expect(updateExpense).toBeDefined();
         expect(updateExpense).toMatchObject({
            ...updateExpenseData,
            id: testExpense.id
         })
         expect(updateExpense!.update_date).not.toEqual(testExpense.update_date);

      })

      test("Should delete expense successfully", async () => {
           const isDeleted = await expenseService.deleteExpense(testExpense.id);

           expect(isDeleted).toBeTruthy();

      })

      describe("Expenses Retrieval Operations", () => {

        beforeAll(async () => {
            // Create test expenses for retrieval tests
            testExpenses = await Promise.all(
                bulkExpensesData.map(expenseData => 
                    expenseService.createExpense(testUser.id, expenseData)))
        });

        test("Should get expenses for past Week", async () => {
            const weeklyExpenses = await expenseService.getExpensesPastWeek(testUser.id);

            expect(weeklyExpenses).toHaveLength(bulkExpensesData.length);
            expect(weeklyExpenses).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(bulkExpensesData[0]),
                    expect.objectContaining(bulkExpensesData[1])
                ])
            )
        })
      });

      test("Should get expenses for past month", async () => {

            const monthlyExpenses = await expenseService.getExpensePastMonth(testUser.id);

            expect(monthlyExpenses).toHaveLength(bulkExpensesData.length);
            expect(monthlyExpenses[0].create_date).toBeInstanceOf(Date);            
        })

      test("Should get expenses for past three months", async () => {

            const quarterlyExpenses= await expenseService.getExpensesPastThreeMonths(testUser.id);

            expect(quarterlyExpenses).toHaveLength(bulkExpensesData.length);

            expect(quarterlyExpenses[0].create_date).toBeInstanceOf(Date);            

        })

      test("Should get expenses by custom date range", async () => {
            const startDate  = new Date();
            startDate.setMonth(startDate.getMonth() -1);
            const endDate = new Date();
            const rangeExpenses = await expenseService.getExpensesByDateRange(testUser.id, startDate, endDate);

            expect(rangeExpenses).toHaveLength(bulkExpensesData.length);
            
            rangeExpenses.forEach((expense) => {
                expect(expense.create_date).toBeInstanceOf(Date);
            })
        })

})