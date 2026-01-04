import { IUser, UserModel } from "../models/user.model";

export interface IUserRepository{

    //create a user 
    createUser(data: Partial<IUser>): Promise<IUser>;

    //get user by their email
    getUserByEmail(email: string): Promise<IUser | null>;

    //get user by their username
    getUserByUsername(username: string): Promise<IUser | null>;

    //get user by their id
    getUserById(id: string): Promise<IUser | null>;

    //get all users at once
    getAllUsers(): Promise<IUser[]>;

    //update a user
    updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>;

    //delete a user
    deleteUser(id: string): Promise<boolean |null>;
}

export class UserRepository implements IUserRepository{


    async createUser(data: Partial<IUser>): Promise<IUser> {
        const newUser = new UserModel(data);
        await newUser.save();
        return newUser;
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({"email": email});
        return user;
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({"username" : username});
        return user;
    }

    async getUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        return user;
    }

    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }

    async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(id, data, { new : true});
        return updatedUser;
    }

    async deleteUser(id: string): Promise<boolean | null> {
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : false;
    }

}