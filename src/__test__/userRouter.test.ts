import express from 'express';
import { UserReq } from "../models/user.interface"
import userRouter from '../routes/userRouter';
import supertest from 'supertest';
import UserService from '../services/user.service';
import { DataSource } from 'typeorm';
import { DBConnected } from '../services/db.service';
import { UserRoute } from "../models/user.route";

/**
 *  test: 
 *   register a new user
 *   register an exsiting user email
 *   login a user with wrong password
 *   login a user with unregister email 
 *   login a user
 */
describe("User Router Tests", () => {
    let userTest: UserReq = {
        name: "Tester",
        email: "tester@test.com",
        password: 'testing123'
    };

    let serverTest:any;
    let AppDataSource: DataSource;
    let userService = new UserService();

    beforeAll(async () => {
        // Wait for database initialization
        AppDataSource = await DBConnected();
        serverTest = express();
        serverTest.use(express.json());
        serverTest.use(UserRoute.ROOT, userRouter); 

    });

    afterAll( async ()=> {
        try {
        await userService.deleteUser(userTest.email);
        await AppDataSource.destroy();
            
        } catch (error) {
            console.error("Cleanup error: ", error)
            
        }
    })

    test("Shuld Register a new user successfuly", async () => {
        const resTest = await supertest(serverTest)
        .post(UserRoute.REGISTER_PATH)
        .send(userTest)
        .expect(201);

        expect(resTest.body).toHaveProperty("token");
        expect(resTest.body.token).toBeTruthy();
    });

    test("Should fail Register an existing email ", async () =>{
        const resTest = await supertest(serverTest).post(UserRoute.REGISTER_PATH)
                    .send(userTest).expect(400);

        expect(resTest.body).toHaveProperty("error");
    });

    test("Should login failed with wrong password", async () => {
        const loginWrongPW: Omit<UserReq, "name"> = {
            email: userTest.email,
            password: "wrong_password",
        }

        const resTest = await supertest(serverTest).post(UserRoute.LOGIN_PATH)
                    .send(loginWrongPW).expect(401);
        
        expect(resTest.body).toHaveProperty("error");
    });

    test("Should login failed with unregister email", async () => {
        const loginUnregisterEmail: Omit<UserReq, "name"> = {
            email: "non@exsiting.com",
            password: userTest.password,
        }
        const resTest = await supertest(serverTest).post(UserRoute.LOGIN_PATH)
                    .send(loginUnregisterEmail).expect(400);
        
        expect(resTest.body).toHaveProperty("error");
    });

    test("Should login a user successfully", async () => {
        const resTest = await supertest(serverTest).post(UserRoute.LOGIN_PATH)
                    .send({
                        email: userTest.email,
                        password: userTest.password
                    } as Omit<UserReq, "name">).expect(200);

        expect(resTest.body).toHaveProperty("token");
        expect(resTest.body.token).toBeTruthy();
    });

})
