import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'admin', ], default: 'user' },
        imageUrl: {type: String, required: false}, // for image URL storage
        notificationHistoryClearedAt: { type: Date, default: null },

        // Optional 2nd-factor-like gate for journal content.
        // Store only a hash; never store the raw passcode.
        journalPasscodeHash: { type: String, default: null },
        journalPasscodeEnabled: { type: Boolean, default: false },
        journalPasscodeUpdatedAt: { type: Date, default: null },
    },
    {
        timestamps: true
    }
);

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    notificationHistoryClearedAt?: Date | null;
    journalPasscodeHash?: string | null;
    journalPasscodeEnabled?: boolean;
    journalPasscodeUpdatedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);