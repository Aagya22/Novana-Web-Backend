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
      imageUrl: data.imageUrl,
    });
  }

  async getAllUsers(): Promise<IUser[]> {
    return UserModel.find().exec();
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

 
  async updateUser(
    id: string,
    updates: Partial<Pick<IUser,
      | "email"
      | "password"
      | "fullName"
      | "username"
      | "phoneNumber"
      | "role"
      | "imageUrl"
    >>
  ): Promise<IUser | null> {
    return this.updateUserById(id, updates);
  }

  async updateUserById(
    id: string,
    updates: Partial<Pick<IUser,
      | "email"
      | "password"
      | "fullName"
      | "username"
      | "phoneNumber"
      | "role"
      | "imageUrl"
    >>
  ): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async deleteUser(id: string): Promise<IUser | null> {
    return this.deleteUserById(id);
  }

  async deleteUserById(id: string): Promise<IUser | null> {
    return UserModel.findByIdAndDelete(id).exec();
  }

  async updateAdminRole(
    id: string,
    role: "user" | "admin"
  ): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, { role }, { new: true }).exec();
  }
}
