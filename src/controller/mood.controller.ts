import { MoodService } from "../services/mood.service";
import { CreateMoodDTO, UpdateMoodDTO } from "../dtos/mood.dto";
import { Request, Response } from "express";

const moodService = new MoodService();

export class MoodController {

    async createMood(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsedData = CreateMoodDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const mood = await moodService.createMood(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                message: "Mood entry created successfully",
                data: mood
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getMoods(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const moods = await moodService.getMoodsByUser(userId);
            return res.status(200).json({
                success: true,
                message: "Moods fetched successfully",
                data: moods
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getMood(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const mood = await moodService.getMoodById(id);
            return res.status(200).json({
                success: true,
                message: "Mood fetched successfully",
                data: mood
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateMood(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parsedData = UpdateMoodDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const mood = await moodService.updateMood(id, parsedData.data);
            return res.status(200).json({
                success: true,
                message: "Mood updated successfully",
                data: mood
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async deleteMood(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await moodService.deleteMood(id);
            return res.status(200).json({
                success: true,
                message: "Mood deleted successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}