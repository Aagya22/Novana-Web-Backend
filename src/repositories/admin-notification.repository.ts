import { AdminNotificationModel, IAdminNotification } from "../models/admin-notification.model";
import mongoose from "mongoose";

export class AdminNotificationRepository {
  async create(data: {
    userId: mongoose.Types.ObjectId;
    userFullName: string;
    userEmail: string;
    message: string;
  }): Promise<IAdminNotification> {
    return AdminNotificationModel.create({
      type: "new_user",
      message: data.message,
      userId: data.userId,
      userFullName: data.userFullName,
      userEmail: data.userEmail,
    });
  }

  async findAll(limit = 50): Promise<IAdminNotification[]> {
    return AdminNotificationModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<IAdminNotification[]>();
  }

  async countUnread(): Promise<number> {
    return AdminNotificationModel.countDocuments({ readAt: null });
  }

  async markRead(id: string): Promise<IAdminNotification | null> {
    return AdminNotificationModel.findByIdAndUpdate(
      id,
      { readAt: new Date() },
      { new: true }
    );
  }

  async markAllRead(): Promise<void> {
    await AdminNotificationModel.updateMany(
      { readAt: null },
      { readAt: new Date() }
    );
  }

  async deleteAll(): Promise<void> {
    await AdminNotificationModel.deleteMany({});
  }
}
