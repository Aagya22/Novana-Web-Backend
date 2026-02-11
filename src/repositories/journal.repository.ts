import { JournalModel, IJournal } from "../models/journal.model";
import { CreateJournalDTO, UpdateJournalDTO } from "../dtos/journal.dto";

export class JournalRepository {

    async createJournal(userId: string, data: CreateJournalDTO): Promise<IJournal> {
        return JournalModel.create({
            userId,
            title: data.title,
            content: data.content,
            date: data.date ? new Date(data.date) : new Date(),
        });
    }

    async getJournalsByUser(userId: string): Promise<IJournal[]> {
        return JournalModel.find({ userId }).sort({ date: -1 }).exec();
    }

    async getJournalById(id: string): Promise<IJournal | null> {
        return JournalModel.findById(id).exec();
    }

    async updateJournal(id: string, updates: UpdateJournalDTO): Promise<IJournal | null> {
        const updateData: any = {};
        if (updates.title) updateData.title = updates.title;
        if (updates.content) updateData.content = updates.content;
        if (updates.date) updateData.date = new Date(updates.date);
        return JournalModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async deleteJournal(id: string): Promise<IJournal | null> {
        return JournalModel.findByIdAndDelete(id).exec();
    }
}