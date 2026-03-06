import { Request, Response } from "express";
import { AdminNotificationRepository } from "../../repositories/admin-notification.repository";

const repo = new AdminNotificationRepository();

export class AdminNotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const [notifications, unreadCount] = await Promise.all([
        repo.findAll(limit),
        repo.countUnread(),
      ]);
      return res.status(200).json({
        success: true,
        data: { notifications, unreadCount },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  async markRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await repo.markRead(id);
      if (!notification) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }
      return res.status(200).json({ success: true, data: notification });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  async markAllRead(_req: Request, res: Response) {
    try {
      await repo.markAllRead();
      return res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  async clearAll(_req: Request, res: Response) {
    try {
      await repo.deleteAll();
      return res.status(200).json({ success: true, message: "All notifications cleared" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }
}
