import { HabitModel, IHabit } from "../models/habit.model";
import { CreateHabitDTO, UpdateHabitDTO } from "../dtos/habit.dto";

export class HabitRepository {

    async createHabit(userId: string, data: CreateHabitDTO): Promise<IHabit> {
        return HabitModel.create({
            userId,
            name: data.name,
            description: data.description,
            frequency: data.frequency,
        });
    }

    async getHabitsByUser(userId: string): Promise<IHabit[]> {
        return HabitModel.find({ userId }).sort({ createdAt: -1 }).exec();
    }

    async getHabitById(id: string): Promise<IHabit | null> {
        return HabitModel.findById(id).exec();
    }

    async updateHabit(id: string, updates: UpdateHabitDTO): Promise<IHabit | null> {
        const updateData: any = {};
        if (updates.name) updateData.name = updates.name;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.frequency) updateData.frequency = updates.frequency;
        if (updates.streak !== undefined) updateData.streak = updates.streak;
        if (updates.lastCompleted) updateData.lastCompleted = new Date(updates.lastCompleted);
        return HabitModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async deleteHabit(id: string): Promise<IHabit | null> {
        return HabitModel.findByIdAndDelete(id).exec();
    }
}