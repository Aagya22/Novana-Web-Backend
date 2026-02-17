import mongoose, { Document, Schema } from "mongoose";

export interface IExercise extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: string;
    duration: number; // in minutes
    durationSeconds?: number; // optional, for more precise guided sessions
    category?: string;
    source: "manual" | "guided";
    date: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ExerciseSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, required: true },
        duration: { type: Number, required: true },
        durationSeconds: { type: Number },
        category: { type: String },
        source: { type: String, enum: ["manual", "guided"], default: "manual", required: true },
        date: { type: Date, required: true, default: Date.now },
        notes: { type: String },
    },
    {
        timestamps: true
    }
);

export const ExerciseModel = mongoose.model<IExercise>('Exercise', ExerciseSchema);