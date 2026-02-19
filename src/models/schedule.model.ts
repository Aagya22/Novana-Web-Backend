import mongoose, { Document, Schema } from "mongoose";

export interface ISchedule extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    date: string;
    time: string;
    description?: string;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ScheduleSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        description: { type: String },
        location: { type: String },
    },
    {
        timestamps: true,
    }
);

ScheduleSchema.index({ userId: 1, date: 1, time: 1 });

export const ScheduleModel = mongoose.model<ISchedule>("Schedule", ScheduleSchema);
