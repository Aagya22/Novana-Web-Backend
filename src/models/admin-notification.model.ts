import mongoose, { Document, Schema } from "mongoose";

export interface IAdminNotification extends Document {
  _id: mongoose.Types.ObjectId;
  type: "new_user";
  message: string;
  userId: mongoose.Types.ObjectId;
  userFullName: string;
  userEmail: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminNotificationSchema: Schema = new Schema(
  {
    type: { type: String, enum: ["new_user"], required: true, default: "new_user" },
    message: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userFullName: { type: String, required: true },
    userEmail: { type: String, required: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

AdminNotificationSchema.index({ createdAt: -1 });

export const AdminNotificationModel = mongoose.model<IAdminNotification>(
  "AdminNotification",
  AdminNotificationSchema
);
