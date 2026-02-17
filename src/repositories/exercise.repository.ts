import { ExerciseModel, IExercise } from "../models/exercise.model";
import { CompleteGuidedExerciseDTO, CreateExerciseDTO, UpdateExerciseDTO } from "../dtos/exercise.dto";
import mongoose from "mongoose";

export class ExerciseRepository {

    async createExercise(userId: string, data: CreateExerciseDTO): Promise<IExercise> {
        return ExerciseModel.create({
            userId,
            type: data.type,
            duration: data.duration,
            date: data.date ? new Date(data.date) : new Date(),
            notes: data.notes,
            source: "manual",
        });
    }

    async completeGuidedExercise(userId: string, data: CompleteGuidedExerciseDTO): Promise<IExercise> {
        const completedAt = data.completedAt ? new Date(data.completedAt) : new Date();
        const durationMinutes = Math.max(1, Math.round(data.elapsedSeconds / 60));

        return ExerciseModel.create({
            userId,
            type: data.title,
            category: data.category,
            duration: durationMinutes,
            durationSeconds: data.elapsedSeconds,
            date: completedAt,
            source: "guided",
        });
    }

    async getGuidedHistoryByUser(userId: string, from?: Date, to?: Date) {
        const match: any = {
            userId: new mongoose.Types.ObjectId(userId),
            source: "guided",
        };

        if (from || to) {
            match.date = {};
            if (from) match.date.$gte = from;
            if (to) match.date.$lte = to;
        }

        const results = await ExerciseModel.aggregate([
            { $match: match },
            {
                $addFields: {
                    day: {
                        $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "UTC" },
                    },
                },
            },
            {
                $group: {
                    _id: "$day",
                    totalMinutes: { $sum: "$duration" },
                    sessions: {
                        $push: {
                            _id: "$_id",
                            title: "$type",
                            category: "$category",
                            duration: "$duration",
                            durationSeconds: "$durationSeconds",
                            date: "$date",
                        },
                    },
                },
            },
            { $sort: { _id: -1 } },
        ]).exec();

        return results.map((r: any) => ({
            date: r._id,
            totalMinutes: r.totalMinutes,
            sessions: r.sessions,
        }));
    }

    async getExercisesByUser(userId: string): Promise<IExercise[]> {
        return ExerciseModel.find({ userId }).sort({ date: -1 }).exec();
    }

    async getExerciseById(id: string): Promise<IExercise | null> {
        return ExerciseModel.findById(id).exec();
    }

    async updateExercise(id: string, updates: UpdateExerciseDTO): Promise<IExercise | null> {
        const updateData: any = {};
        if (updates.type) updateData.type = updates.type;
        if (updates.duration) updateData.duration = updates.duration;
        if (updates.date) updateData.date = new Date(updates.date);
        if (updates.notes !== undefined) updateData.notes = updates.notes;
        return ExerciseModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async deleteExercise(id: string): Promise<IExercise | null> {
        return ExerciseModel.findByIdAndDelete(id).exec();
    }
}