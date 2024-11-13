import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../models/User.entity"
import { env } from "./env.service";
import { Expense } from "../models/Expense.entity";

const AppDataSource = new DataSource({
    type: "postgres",
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    synchronize: env.NODE_ENV !== 'production',
    logging: false,
    entities: [User, Expense],
    migrations: [],
    subscribers: [],
})


export async function DBConnected() {
    if(AppDataSource.isInitialized){
        return AppDataSource;
    }
    else{
        try {
           const db = await AppDataSource.initialize(); 
           console.log("Data Source has been initialized!");
           return db;
        } catch (error) {
            console.error("Error during Data Source initialization", error);
            throw new Error("Error during Data Source initialization");
            
        }
    }
}