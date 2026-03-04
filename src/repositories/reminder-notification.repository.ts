import mongoose from "mongoose";
import { ReminderNotificationModel, IReminderNotification } from "../models/reminder-notification.model";

export class ReminderNotificationRepository {
  async listByUser(userId: string, limit = 20): Promise<IReminderNotification[]> {
    return ReminderNotificationModel.find({ userId, deletedAt: null })
      .sort({ deliveredAt: -1 })
      .limit(limit)
      .exec();
  }

  async markAllRead(userId: string): Promise<number> {
    const res = await ReminderNotificationModel.updateMany(
      { userId, deletedAt: null, readAt: null },
      { $set: { readAt: new Date() } }
    ).exec();
    return res.modifiedCount ?? 0;
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
    
      if (err?.code === 11000) return null;
      throw err;
    }
  }

  async markRead(userId: string, id: string): Promise<IReminderNotification | null> {
    return ReminderNotificationModel.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { readAt: new Date() },
      { new: true }
    ).exec();
  }
}
