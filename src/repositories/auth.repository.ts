import { UserModel, IUser } from "../models/user.model";
import { CreateUserDTO } from "../dtos/user.dto";

export class UserRepository {

  async createUser(data: CreateUserDTO): Promise<IUser> {
    return UserModel.create({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      username: data.username,
      phoneNumber: data.phoneNumber,
    });
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return UserModel.findOne({ username }).exec();
  }

  async getUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  async updateUserById(
    id: string,
    updates: Partial<Pick<IUser,
      "email" |
      "password" |
      "fullName" |
      "username" |
      "phoneNumber" |
      "role" |
      "imageUrl"
    >>
  ): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async deleteUserById(id: string): Promise<IUser | null> {
    return UserModel.findByIdAndDelete(id).exec();
  }

  async updateAdminRole(
    id: string,
    role: "user" | "admin" | "provider"
  ): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, { role }, { new: true }).exec();
  }
}