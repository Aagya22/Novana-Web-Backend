import { MoodModel, IMood } from "../models/mood.model";
import { CreateMoodDTO, UpdateMoodDTO } from "../dtos/mood.dto";

export class MoodRepository {

    async createMood(userId: string, data: CreateMoodDTO): Promise<IMood> {
        return MoodModel.create({
            userId,
            mood: data.mood,
            note: data.note,
            date: data.date ? new Date(data.date) : new Date(),
        });
    }

    async getMoodsByUser(userId: string): Promise<IMood[]> {
        return MoodModel.find({ userId }).sort({ date: -1 }).exec();
    }

    async getMoodById(id: string): Promise<IMood | null> {
        return MoodModel.findById(id).exec();
    }

    async updateMood(id: string, updates: UpdateMoodDTO): Promise<IMood | null> {
        const updateData: any = {};
        if (updates.mood) updateData.mood = updates.mood;
        if (updates.note !== undefined) updateData.note = updates.note;
        if (updates.date) updateData.date = new Date(updates.date);
        return MoodModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async deleteMood(id: string): Promise<IMood | null> {
        return MoodModel.findByIdAndDelete(id).exec();
    }
}