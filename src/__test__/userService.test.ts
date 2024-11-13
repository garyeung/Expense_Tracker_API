import { DataSource } from "typeorm";
import { User } from "../models/User.entity";
import { DBConnected } from "../services/db.service";
import UserService from "../services/user.service"

describe("User Service Test", () => {
    let testNewUser: User;
    let testUserService: UserService;
    let AppDataSource: DataSource;
    const testUser: Partial<User> = {
        name: "tester",
        email: "testemail@tester.com",
        password: "testing123"
        
    }

    beforeAll(async () => {
        AppDataSource = await DBConnected();
        testUserService = new UserService();
    })

    afterAll(async () => {
        await AppDataSource.destroy();
    })



    test("Should create a new user successfully", async () => {
        testNewUser = await testUserService.createUser(testUser);

        expect(testNewUser).toBeDefined();
        expect(testNewUser).toHaveProperty("id");
        expect(testNewUser.name).toBe(testUser.name);
        expect(testNewUser.email).toBe(testUser.email);

    });

    test("Should find a user by email", async () => {
        const foundUser = await testUserService.findUser(testUser.email!);

        expect(foundUser).toBeDefined();
        expect(foundUser).toBeInstanceOf(User);
        expect(foundUser!.id).toEqual(testNewUser.id);
        expect(foundUser!.email).toBe(testUser.email)
    })

    test("Should return null for non-existent user", async () => {
        const foundUser = await testUserService.findUser("nonexistent@email.com");
        expect(foundUser).toBeNull();
    })

    test('Should delete a user successfully', async () => {
        const isDeleted = await testUserService.deleteUser(testNewUser.email);

        expect(isDeleted).toBe(true);

        //vefity user is actually deleted
        const foundUser = await testUserService.findUser(testUser.email!);
        expect(foundUser).toBeNull();
    })

    test("Should return false when deleting non-existent user", async () => {
       const isDeleted = await testUserService.deleteUser("nonexist@email.com");

       expect(isDeleted).toBe(false);
    })
})