import { Router } from "express";
import { login, register } from "../controllers/userController";
import { UserRoute } from "../models/user.route";
const userRouter = Router();

userRouter.post(UserRoute.LOGIN, login);
userRouter.post(UserRoute.REGISTER, register);

export default userRouter;