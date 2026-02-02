import { CreateUserDTO, LoginUserDto,  UpdateUserDto } from "../dtos/user.dto";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { UserRepository } from "../repositories/auth.repository";

const userRepository = new UserRepository();

export class UserService {

  /* -------------------- CREATE USER -------------------- */
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email is already in use");
    }

    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(403, "Username is already taken");
    }

    data.password = await bcryptjs.hash(data.password, 10);
    return userRepository.createUser(data);
  }

  /* -------------------- LOGIN -------------------- */
  async loginUser(data: LoginUserDto) {
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
      phoneNumber: user.phoneNumber,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    return { token, user };
  }


  async getUserById(userId: string) {
    if (!userId) {
      throw new HttpError(400, "User ID is required");
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return user;
  }


  async makeAdmin(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return userRepository.updateAdminRole(userId, "admin");
  }

 
  async updateUser(userId: string, data: UpdateUserDto) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }


    if (data.email && data.email !== user.email) {
      const emailExists = await userRepository.getUserByEmail(data.email);
      if (emailExists) {
        throw new HttpError(409, "Email already exists");
      }
    }


    if (data.username && data.username !== user.username) {
      const usernameExists = await userRepository.getUserByUsername(data.username);
      if (usernameExists) {
        throw new HttpError(409, "Username already exists");
      }
    }

 
    if (data.password) {
      data.password = await bcryptjs.hash(data.password, 10);
    }

    return userRepository.updateUserById(userId, data);
  }
}