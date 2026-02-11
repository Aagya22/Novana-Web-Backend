import { ReminderModel, IReminder } from "../models/reminder.model";
import { CreateReminderDTO, UpdateReminderDTO } from "../dtos/reminder.dto";

export class ReminderRepository {

    async createReminder(userId: string, data: CreateReminderDTO): Promise<IReminder> {
        return ReminderModel.create({
            userId,
            title: data.title,
            time: data.time,
            date: data.date ? new Date(data.date) : new Date(),
            recurring: data.recurring ?? true,
        });
    }

    async getRemindersByUser(userId: string): Promise<IReminder[]> {
        return ReminderModel.find({ userId }).sort({ time: 1 }).exec();
    }

    async getReminderById(id: string): Promise<IReminder | null> {
        return ReminderModel.findById(id).exec();
    }

    async updateReminder(id: string, updates: UpdateReminderDTO): Promise<IReminder | null> {
        const updateData: any = {};
        if (updates.title) updateData.title = updates.title;
        if (updates.time) updateData.time = updates.time;
        if (updates.done !== undefined) updateData.done = updates.done;
        if (updates.date) updateData.date = new Date(updates.date);
        if (updates.recurring !== undefined) updateData.recurring = updates.recurring;
        return ReminderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async deleteReminder(id: string): Promise<IReminder | null> {
        return ReminderModel.findByIdAndDelete(id).exec();
    }
}