import mongoose, { Document, Schema } from "mongoose";

export interface IMood extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    mood: number; // 1-10 scale
    moodType?: string;
    note?: string;
    dayKey?: string; // YYYY-MM-DD (local day)
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MoodSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        mood: { type: Number, required: true, min: 1, max: 10 },
        moodType: { type: String },
        note: { type: String },
        dayKey: { type: String },
        date: { type: Date, required: true, default: Date.now },
    },
    {
        timestamps: true
    }
);

MoodSchema.index(
    { userId: 1, dayKey: 1 },
    {
        unique: true,
        partialFilterExpression: { dayKey: { $exists: true } },
    }
);

export const MoodModel = mongoose.model<IMood>('Mood', MoodSchema);