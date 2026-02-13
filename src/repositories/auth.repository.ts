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

  async getAllUsersWithPagination(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ users: IUser[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    let query: any = {};
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await UserModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await UserModel.countDocuments(query).exec();
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      totalPages
    };
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
