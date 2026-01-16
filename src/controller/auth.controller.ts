import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";

let userService = new UserService();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map((i) => i.message).join(", ");
                return res.status(400).json({
                    success: false,
                    message: messages
                });
            }

            const userData: CreateUserDTO = parsedData.data;
            const newUser = await userService.createUser(userData);

            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: {
                    id: newUser._id,
                    email: newUser.email,
                    fullName: newUser.fullName,
                    username: newUser.username,
                    phoneNumber: newUser.phoneNumber,
                    role: newUser.role
                }
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map((i) => i.message).join(", ");
                return res.status(400).json({
                    success: false,
                    message: messages
                });
            }

            const loginData: LoginUserDTO = parsedData.data;
            const { token, user } = await userService.loginUser(loginData);

            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    username: user.username,
                    phoneNumber: user.phoneNumber,
                    role: user.role
                },
                token
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}