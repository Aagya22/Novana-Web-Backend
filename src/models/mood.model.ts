import mongoose, { Document, Schema } from "mongoose";

export interface IMood extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    mood: number; // 1-10 scale
    note?: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MoodSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        mood: { type: Number, required: true, min: 1, max: 10 },
        note: { type: String },
        date: { type: Date, required: true, default: Date.now },
    },
    {
        timestamps: true
    }
);

export const MoodModel = mongoose.model<IMood>('Mood', MoodSchema);