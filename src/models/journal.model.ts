import mongoose, { Document, Schema } from "mongoose";

export interface IJournal extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    content: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const JournalSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        date: { type: Date, required: true, default: Date.now },
    },
    {
        timestamps: true
    }
);

export const JournalModel = mongoose.model<IJournal>('Journal', JournalSchema);