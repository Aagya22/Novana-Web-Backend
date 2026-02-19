import { Request, Response } from "express";
import { CreateScheduleDTO, UpdateScheduleDTO } from "../dtos/schedule.dto";
import { ScheduleService } from "../services/schedule.service";

const scheduleService = new ScheduleService();

function isDateKey(value: unknown): value is string {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export class ScheduleController {

    async createSchedule(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsed = CreateScheduleDTO.safeParse(req.body);
            if (!parsed.success) {
                const messages = parsed.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const created = await scheduleService.createSchedule(userId, parsed.data);
            return res.status(201).json({
                success: true,
                message: "Schedule created successfully",
                data: created,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getSchedules(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const q = typeof req.query.q === "string" ? req.query.q : undefined;
            const from = isDateKey(req.query.from) ? (req.query.from as string) : undefined;
            const to = isDateKey(req.query.to) ? (req.query.to as string) : undefined;

            if ((req.query.from && !from) || (req.query.to && !to)) {
                return res.status(400).json({ success: false, message: "Invalid from/to date filter" });
            }

            const schedules = await scheduleService.getSchedulesByUser(userId, { q, from, to });
            return res.status(200).json({
                success: true,
                message: "Schedules fetched successfully",
                data: schedules,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getSchedule(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const { id } = req.params;
            const schedule = await scheduleService.getScheduleById(userId, id);
            return res.status(200).json({
                success: true,
                message: "Schedule fetched successfully",
                data: schedule,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async updateSchedule(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const { id } = req.params;
            const parsed = UpdateScheduleDTO.safeParse(req.body);
            if (!parsed.success) {
                const messages = parsed.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const updated = await scheduleService.updateSchedule(userId, id, parsed.data);
            return res.status(200).json({
                success: true,
                message: "Schedule updated successfully",
                data: updated,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async deleteSchedule(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const { id } = req.params;
            await scheduleService.deleteSchedule(userId, id);
            return res.status(200).json({
                success: true,
                message: "Schedule deleted successfully",
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
