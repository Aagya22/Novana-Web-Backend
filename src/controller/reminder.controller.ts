import { ReminderService } from "../services/reminder.service";
import { CreateReminderDTO, UpdateReminderDTO } from "../dtos/reminder.dto";
import { Request, Response } from "express";

const reminderService = new ReminderService();

export class ReminderController {

    async getNotificationHistory(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const limitRaw = req.query.limit;
            const limit = typeof limitRaw === "string" ? Math.min(100, Math.max(1, parseInt(limitRaw, 10) || 20)) : 20;

            const notifications = await reminderService.getNotificationHistory(userId, limit);
            return res.status(200).json({
                success: true,
                message: "Notifications fetched successfully",
                data: notifications,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async markNotificationRead(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const { id } = req.params;
            const updated = await reminderService.markNotificationRead(userId, id);
            return res.status(200).json({
                success: true,
                message: "Notification marked as read",
                data: updated,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getDueReminders(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const wmRaw = req.query.windowMinutes;
            const windowMinutes = typeof wmRaw === "string" ? Math.min(10, Math.max(0, parseInt(wmRaw, 10) || 2)) : 2;

            const delivered = await reminderService.deliverDueReminders(userId, windowMinutes);
            return res.status(200).json({
                success: true,
                message: "Due reminders checked",
                data: delivered,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async createReminder(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsedData = CreateReminderDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const reminder = await reminderService.createReminder(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                message: "Reminder created successfully",
                data: reminder
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getReminders(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const reminders = await reminderService.getRemindersByUser(userId);
            return res.status(200).json({
                success: true,
                message: "Reminders fetched successfully",
                data: reminders
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getReminder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const reminder = await reminderService.getReminderById(id);
            return res.status(200).json({
                success: true,
                message: "Reminder fetched successfully",
                data: reminder
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateReminder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parsedData = UpdateReminderDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const reminder = await reminderService.updateReminder(id, parsedData.data);
            return res.status(200).json({
                success: true,
                message: "Reminder updated successfully",
                data: reminder
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async deleteReminder(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await reminderService.deleteReminder(id);
            return res.status(200).json({
                success: true,
                message: "Reminder deleted successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async toggleDone(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const reminder = await reminderService.toggleReminderDone(id);
            return res.status(200).json({
                success: true,
                message: "Reminder toggled successfully",
                data: reminder
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}