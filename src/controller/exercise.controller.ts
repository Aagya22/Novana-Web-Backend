import { ExerciseService } from "../services/exercise.service";
import { CompleteGuidedExerciseDTO, CreateExerciseDTO, UpdateExerciseDTO } from "../dtos/exercise.dto";
import { Request, Response } from "express";

const exerciseService = new ExerciseService();

export class ExerciseController {

    async completeGuidedExercise(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsedData = CompleteGuidedExerciseDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const session = await exerciseService.completeGuidedExercise(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                message: "Guided exercise completed",
                data: session,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async getGuidedHistory(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const from = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
            const to = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;

            const history = await exerciseService.getGuidedHistory(userId, from, to);
            return res.status(200).json({
                success: true,
                message: "Guided exercise history fetched successfully",
                data: history,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }

    async createExercise(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsedData = CreateExerciseDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const exercise = await exerciseService.createExercise(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                message: "Exercise entry created successfully",
                data: exercise
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getExercises(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const exercises = await exerciseService.getExercisesByUser(userId);
            return res.status(200).json({
                success: true,
                message: "Exercises fetched successfully",
                data: exercises
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getExercise(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const exercise = await exerciseService.getExerciseById(id);
            return res.status(200).json({
                success: true,
                message: "Exercise fetched successfully",
                data: exercise
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateExercise(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parsedData = UpdateExerciseDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const exercise = await exerciseService.updateExercise(id, parsedData.data);
            return res.status(200).json({
                success: true,
                message: "Exercise updated successfully",
                data: exercise
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async deleteExercise(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await exerciseService.deleteExercise(id);
            return res.status(200).json({
                success: true,
                message: "Exercise deleted successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}