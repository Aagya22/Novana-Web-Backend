import mongoose, { Document, Schema } from "mongoose";

export interface IReminder extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    // Canonical format: "HH:mm" (24h), but legacy values may exist.
    time: string;
    // New
    type: "journal" | "mood" | "exercise";
    daysOfWeek: number[]; // 0 (Sun) .. 6 (Sat)
    enabled: boolean;
    lastTriggeredAt?: Date;
    // Legacy (kept for older clients; not used by the app)
    date: Date;
    recurring: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReminderSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        time: { type: String, required: true },
        type: { type: String, enum: ["journal", "mood", "exercise"], default: "journal" },
        daysOfWeek: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
        enabled: { type: Boolean, default: true },
        lastTriggeredAt: { type: Date },

        // Legacy
        date: { type: Date, required: true, default: Date.now },
        recurring: { type: Boolean, default: true },
    },
    {
        timestamps: true
    }
);

export const ReminderModel = mongoose.model<IReminder>('Reminder', ReminderSchema);