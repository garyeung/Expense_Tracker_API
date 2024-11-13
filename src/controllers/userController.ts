import { Request, Response } from "express";
import { UserReq } from "../models/user.interface";
import { User } from "../models/User.entity";
import { passwordHashing, passwordCompare } from "../services/hash.service";
import { tokenGenerate } from "../services/token.service";
import UserService from "../services/user.service";

const userTable = new UserService();

export async function register(request: Request, response: Response) {
   const user: UserReq |null = request.body;

   if(!user?.email || !user.name){
     response.status(400).json({
        error: "Email and name are required"
     });
     return;
   }
   const exisiting = await userTable.findUser(user.email);

   if(exisiting){
        response.status(400).json({
            error: "Email already exists"
        })
        return;
   }

   try {
        const hashedPW = await passwordHashing(user.password);
        const userCreating:Partial<User> = {
            email: user.email,
            name: user.name,
            password: hashedPW,
        };

        const userSaved = await userTable.createUser(userCreating);

        const token = tokenGenerate(userSaved);

        response.status(201).json({token});
   } catch (error) {
        console.error('Registration error:', error);
        response.status(500).json({error: 'Failed to register user'});

    
   }
}


export async function login(request: Request, response: Response) {
   const user:Omit<UserReq, "name"> | null = request.body;

   try {
        const userFound = await userTable.findUser(user!.email) 
        if(!userFound){
            response.status(400).json({
                error: "Invalid email"
            });
            return;
        }

        const isMatch = await passwordCompare(user!.password, userFound.password)

        if(!isMatch){
            response.status(401).json({
                error: "Password incorrect"
            });
            return;
        }
        const token = tokenGenerate(userFound);
        response.status(200).json({token});

   } catch (error) {
        console.error('Login error:', error);    
        response.status(500).json({error: 'Failed to login'});

   }
}