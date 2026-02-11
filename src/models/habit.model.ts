import mongoose, { Document, Schema } from "mongoose";

export interface IHabit extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    frequency: string; // e.g., 'daily', 'weekly'
    streak: number;
    lastCompleted?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const HabitSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        description: { type: String },
        frequency: { type: String, required: true, enum: ['daily', 'weekly', 'monthly'] },
        streak: { type: Number, default: 0 },
        lastCompleted: { type: Date },
    },
    {
        timestamps: true
    }
);

export const HabitModel = mongoose.model<IHabit>('Habit', HabitSchema);