import mongoose, { Document, Schema } from "mongoose";

export interface IReminderNotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  reminderId: mongoose.Types.ObjectId;
  title: string;
  type: "journal" | "mood" | "exercise";
  scheduledFor: Date;
  deliveredAt: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderNotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reminderId: { type: Schema.Types.ObjectId, ref: "Reminder", required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["journal", "mood", "exercise"], required: true },
    scheduledFor: { type: Date, required: true },
    deliveredAt: { type: Date, required: true, default: Date.now, index: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate deliveries for the same reminder occurrence
ReminderNotificationSchema.index(
  { userId: 1, reminderId: 1, scheduledFor: 1 },
  { unique: true }
);

export const ReminderNotificationModel = mongoose.model<IReminderNotification>(
  "ReminderNotification",
  ReminderNotificationSchema
);
