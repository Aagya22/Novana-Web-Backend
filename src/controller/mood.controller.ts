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

            const result = await moodService.createMood(userId, parsedData.data);
            return res.status(result.replaced ? 200 : 201).json({
                success: true,
                message: result.replaced ? "Mood entry updated successfully" : "Mood entry created successfully",
                data: result.mood
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

    async getMoodAnalytics(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const analytics = await moodService.getMoodAnalytics(userId);
            return res.status(200).json({
                success: true,
                message: "Mood analytics fetched successfully",
                data: analytics
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getMoodOverview(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const overview = await moodService.getMoodOverview(userId);
            return res.status(200).json({
                success: true,
                message: "Mood overview fetched successfully",
                data: overview,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getMoodByDate(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const date = (req.query.date as string | undefined) ?? "";
            if (!date) {
                return res.status(400).json({ success: false, message: "date query param is required" });
            }

            const mood = await moodService.getMoodByDate(userId, date);
            return res.status(200).json({
                success: true,
                message: "Mood fetched successfully",
                data: mood,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getMood(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const { id } = req.params;
            const mood = await moodService.getMoodById(userId, id);
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
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const { id } = req.params;
            const parsedData = UpdateMoodDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const mood = await moodService.updateMood(userId, id, parsedData.data);
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
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const { id } = req.params;
            await moodService.deleteMood(userId, id);
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