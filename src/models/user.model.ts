import mongoose,{ Document, Schema} from "mongoose";
import { UserType } from "../types/user.type";


const UserSchema: Schema = new Schema(
    {
        fullName: { type: String,required: true},
        email : { type: String, required: true, unique: true},
        phoneNumber: { type: Number, required: true, unique: true },
        username : { type: String, required: true, unique: true},
        password : { type: String, required: true},
        role: {type: String, enum: ['user','admin',"seller"], default: 'user'}
    },
    {
        timestamps: true, //auto createdAt and updatedAt
    }
)

export interface IUser extends UserType, Document{// combined type
    _id: mongoose.Types.ObjectId; //mogo realted attribute
    createdAt: Date;
    updatedAt: Date;

}

export const UserModel = mongoose.model<IUser>('User', UserSchema);