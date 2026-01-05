import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { UserRepository } from "../repositories/auth.repository";

let userRepository = new UserRepository();

export class UserService {
    async createUser(data: CreateUserDTO) {
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if (emailCheck) {
            throw new HttpError(403, "Email is already in use");
        }

        const usernameCheck = await userRepository.getUserByUsername(data.username);
        if (usernameCheck) {
            throw new HttpError(403, "Username is already taken");
        }

        const hashedPassword = await bcryptjs.hash(data.password, 10);
        data.password = hashedPassword;

        const newUser = await userRepository.createUser(data);
        return newUser;
    }

    async loginUser(data: LoginUserDTO) {
        const user = await userRepository.getUserByEmail(data.email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const validPassword = await bcryptjs.compare(data.password, user.password);
        if (!validPassword) {
            throw new HttpError(401, "Invalid credentials");
        }

        const payload = {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            username: user.username,
            role: user.role,
            phoneNumber: user.phoneNumber
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
        return { token, user };
    }
}
