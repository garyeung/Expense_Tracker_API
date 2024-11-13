import jwt from 'jsonwebtoken';
import { JwtPayload } from "../models/jwtPayload.interface";
import { env } from "./env.service";
import { NextFunction, Request, Response } from 'express';
import { User } from '../models/User.entity';

const SECRET = env.SECRET;

export function tokenGenerate(user: User){
    const payload: JwtPayload = {
        id: user.id,
        email: user.email 
    }

    return jwt.sign(payload, SECRET, {expiresIn: '1h'})
}

export async function tokenVerify(request: Request, response: Response, next: NextFunction) {
    const token = request.headers['authorization']?.split(" ")[1];

    if(!token){
        response.status(401).json({
            message: 'Unauthorized'
        });
        return;
    }

    try {
        const decoded =  jwt.verify(token, SECRET) as JwtPayload;

        request.user = {
            id: decoded.id,
            email: decoded.email
        }

        next();

    } catch (error) {
        console.error("Token verification error: ", error);
        response.status(401).json({message: "Unauthorized"});
        
    }
    
}