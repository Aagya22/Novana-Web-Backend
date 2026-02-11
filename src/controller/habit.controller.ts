import { HabitService } from "../services/habit.service";
import { CreateHabitDTO, UpdateHabitDTO } from "../dtos/habit.dto";
import { Request, Response } from "express";

const habitService = new HabitService();

export class HabitController {

    async createHabit(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsedData = CreateHabitDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const habit = await habitService.createHabit(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                message: "Habit created successfully",
                data: habit
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getHabits(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const habits = await habitService.getHabitsByUser(userId);
            return res.status(200).json({
                success: true,
                message: "Habits fetched successfully",
                data: habits
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getHabit(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const habit = await habitService.getHabitById(id);
            return res.status(200).json({
                success: true,
                message: "Habit fetched successfully",
                data: habit
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateHabit(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parsedData = UpdateHabitDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const habit = await habitService.updateHabit(id, parsedData.data);
            return res.status(200).json({
                success: true,
                message: "Habit updated successfully",
                data: habit
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async deleteHabit(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await habitService.deleteHabit(id);
            return res.status(200).json({
                success: true,
                message: "Habit deleted successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async markCompleted(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const habit = await habitService.markHabitCompleted(id);
            return res.status(200).json({
                success: true,
                message: "Habit marked as completed",
                data: habit
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}