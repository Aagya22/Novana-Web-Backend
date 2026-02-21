import mongoose from "mongoose";
import { ReminderNotificationModel, IReminderNotification } from "../models/reminder-notification.model";

export class ReminderNotificationRepository {
  async listByUser(userId: string, limit = 20): Promise<IReminderNotification[]> {
    return ReminderNotificationModel.find({ userId })
      .sort({ deliveredAt: -1 })
      .limit(limit)
      .exec();
  }

  async deleteById(userId: string, id: string): Promise<boolean> {
    const res = await ReminderNotificationModel.deleteOne({ _id: id, userId }).exec();
    return (res.deletedCount ?? 0) > 0;
  }

  async deleteAllByUser(userId: string): Promise<number> {
    const res = await ReminderNotificationModel.deleteMany({ userId }).exec();
    return res.deletedCount ?? 0;
  }

  async createIfNotExists(params: {
    userId: string;
    reminderId: string;
    title: string;
    type: "journal" | "mood" | "exercise";
    scheduledFor: Date;
  }): Promise<IReminderNotification | null> {
    try {
      const doc = await ReminderNotificationModel.create({
        userId: new mongoose.Types.ObjectId(params.userId),
        reminderId: new mongoose.Types.ObjectId(params.reminderId),
        title: params.title,
        type: params.type,
        scheduledFor: params.scheduledFor,
        deliveredAt: new Date(),
      });
      return doc;
    } catch (err: any) {
      // Duplicate key => already delivered for this occurrence
      if (err?.code === 11000) return null;
      throw err;
    }
  }

  async markRead(userId: string, id: string): Promise<IReminderNotification | null> {
    return ReminderNotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { readAt: new Date() },
      { new: true }
    ).exec();
  }
}
