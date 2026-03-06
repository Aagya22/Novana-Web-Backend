import { CreateUserDTO, UpdateUserDto } from "../../dtos/user.dto";

import  bcryptjs from "bcryptjs"
import { HttpError } from "../../errors/http-error";
import { UserRepository } from "../../repositories/auth.repository";
import { AdminNotificationRepository } from "../../repositories/admin-notification.repository";

let userRepository = new UserRepository();
const adminNotificationRepo = new AdminNotificationRepository();

export class AdminUserService {
    async createUser(data: CreateUserDTO){
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        const usernameCheck = await userRepository.getUserByUsername(data.username);
        if(usernameCheck){
            throw new HttpError(403, "Username already in use");
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword;

        const newUser = await userRepository.createUser(data);

        // Notify admins about new user created by admin
        try {
          await adminNotificationRepo.create({
            userId: newUser._id as any,
            userFullName: newUser.fullName,
            userEmail: newUser.email,
            message: `New user created by admin: ${newUser.fullName} (${newUser.email})`,
          });
        } catch (_err) {
        }

        return newUser;
    }

    async getAllUsersWithPagination(page: number = 1, limit: number = 10, search?: string){
        const result = await userRepository.getAllUsersWithPagination(page, limit, search);
        return result;
    }

    async deleteUser(id: string){
        const user = await userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const deleted = await userRepository.deleteUser(id);
        return deleted;
    }

    async updateUser(id: string, updateData: UpdateUserDto){
        const user = await userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const updatedUser = await userRepository.updateUser(id, updateData);
        return updatedUser;
    }

    async  getUserById(id: string){
        const user = await userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }

}