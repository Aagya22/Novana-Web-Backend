import mongoose, { Document, Schema } from "mongoose";

export interface IReminder extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    time: string; // e.g., "7:00 AM"
    done: boolean;
    date: Date; // the date for the reminder
    recurring: boolean; // if true, repeats daily
    createdAt: Date;
    updatedAt: Date;
}

const ReminderSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        time: { type: String, required: true },
        done: { type: Boolean, default: false },
        date: { type: Date, required: true, default: Date.now },
        recurring: { type: Boolean, default: true },
    },
    {
        timestamps: true
    }
);

export const ReminderModel = mongoose.model<IReminder>('Reminder', ReminderSchema);