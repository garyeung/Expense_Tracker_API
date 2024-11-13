import "reflect-metadata";
import express from "express";
import { env } from "./services/env.service";
import expenseRouter from "./routes/expenseRouter";
import userRouter from "./routes/userRouter";
import { UserRoute } from "./models/user.route";
import { ExpenseRoute } from "./models/expense.route";


const server = express();

server.use(express.json());

server.use(UserRoute.ROOT, userRouter); 
server.use(ExpenseRoute.ROOT, expenseRouter);

try {
    server.listen(env.PORT, ()=> {
    console.log(`Server is running on http://localhost:${env.PORT}`)
})
    
} catch (error) {
   console.error("Fail to running Server", error) ;
   process.exit(1);
}