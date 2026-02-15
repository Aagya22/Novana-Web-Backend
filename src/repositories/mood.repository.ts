import { MoodModel, IMood } from "../models/mood.model";
import { CreateMoodDTO, UpdateMoodDTO } from "../dtos/mood.dto";
import mongoose from "mongoose";

export type MoodAnalytics = {
    overTime: Array<{ date: Date; mood: number }>;
    weeklyAverage: Array<{ isoWeekYear: number; isoWeek: number; averageMood: number }>;
};

export class MoodRepository {

    async getMoodForUserByDateRange(userId: string, start: Date, end: Date): Promise<IMood | null> {
        return MoodModel.findOne({ userId, date: { $gte: start, $lt: end } }).sort({ date: -1 }).exec();
    }

    async getMoodsForUserByDateRange(userId: string, start: Date, end: Date): Promise<IMood[]> {
        return MoodModel.find({ userId, date: { $gte: start, $lt: end } }).sort({ date: 1 }).exec();
    }

    async getRecentMoodsByUser(userId: string, limit = 400): Promise<IMood[]> {
        return MoodModel.find({ userId })
            .sort({ date: -1 })
            .limit(limit)
            .select({ mood: 1, moodType: 1, note: 1, date: 1, createdAt: 1, updatedAt: 1 })
            .exec();
    }

    async createMood(userId: string, data: CreateMoodDTO & { dayKey?: string }): Promise<IMood> {
        return MoodModel.create({
            userId,
            mood: data.mood,
            moodType: data.moodType,
            note: data.note,
            dayKey: data.dayKey,
            date: data.date ? new Date(data.date) : new Date(),
        });
    }

    async getMoodsByUser(userId: string): Promise<IMood[]> {
        return MoodModel.find({ userId }).sort({ date: -1 }).exec();
    }

    async getMoodById(id: string): Promise<IMood | null> {
        return MoodModel.findById(id).exec();
    }

    async getMoodByIdForUser(userId: string, id: string): Promise<IMood | null> {
        return MoodModel.findOne({ _id: id, userId }).exec();
    }

    async updateMood(id: string, updates: UpdateMoodDTO): Promise<IMood | null> {
        const updateData: any = {};
        if (updates.mood) updateData.mood = updates.mood;
        if (updates.note !== undefined) updateData.note = updates.note;
        if (updates.date) updateData.date = new Date(updates.date);
        return MoodModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
    }

    async updateMoodForUser(
        userId: string,
        id: string,
        updates: Pick<UpdateMoodDTO, "mood" | "moodType" | "note"> & { dayKey?: string }
    ): Promise<IMood | null> {
        const updateData: any = {};
        if (updates.mood !== undefined) updateData.mood = updates.mood;
        if (updates.moodType !== undefined) updateData.moodType = updates.moodType;
        if (updates.note !== undefined) updateData.note = updates.note;
        if (updates.dayKey !== undefined) updateData.dayKey = updates.dayKey;
        return MoodModel.findOneAndUpdate({ _id: id, userId }, updateData, { new: true, runValidators: true }).exec();
    }

    async deleteOtherMoodsForUserInDateRange(userId: string, start: Date, end: Date, keepId: string) {
        return MoodModel.deleteMany({
            userId,
            date: { $gte: start, $lt: end },
            _id: { $ne: keepId },
        }).exec();
    }

    async deleteMood(id: string): Promise<IMood | null> {
        return MoodModel.findByIdAndDelete(id).exec();
    }

    async deleteMoodForUser(userId: string, id: string): Promise<IMood | null> {
        return MoodModel.findOneAndDelete({ _id: id, userId }).exec();
    }

    async getMoodAnalytics(userId: string): Promise<MoodAnalytics> {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const overTime = await MoodModel.find({ userId: userObjectId })
            .sort({ date: 1 })
            .select({ date: 1, mood: 1 })
            .lean()
            .exec();

        const weeklyAverageRaw = await MoodModel.aggregate([
            { $match: { userId: userObjectId } },
            {
                $group: {
                    _id: {
                        isoWeekYear: { $isoWeekYear: "$date" },
                        isoWeek: { $isoWeek: "$date" },
                    },
                    averageMood: { $avg: "$mood" },
                },
            },
            { $sort: { "_id.isoWeekYear": 1, "_id.isoWeek": 1 } },
            {
                $project: {
                    _id: 0,
                    isoWeekYear: "$_id.isoWeekYear",
                    isoWeek: "$_id.isoWeek",
                    averageMood: "$averageMood",
                },
            },
        ]).exec();

        const weeklyAverage = (weeklyAverageRaw as Array<any>).map((row) => ({
            isoWeekYear: row.isoWeekYear,
            isoWeek: row.isoWeek,
            averageMood: Math.round((row.averageMood ?? 0) * 10) / 10,
        }));

        return {
            overTime: overTime.map((row: any) => ({ date: row.date, mood: row.mood })),
            weeklyAverage,
        };
    }
}