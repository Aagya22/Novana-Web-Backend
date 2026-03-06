import { JournalModel, IJournal } from "../models/journal.model";
import { CreateJournalDTO, UpdateJournalDTO } from "../dtos/journal.dto";

export type ListJournalsOptions = {
    q?: string;
    startDate?: Date;
    endDate?: Date;
};

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class JournalRepository {

    async createJournal(userId: string, data: CreateJournalDTO): Promise<IJournal> {
        return JournalModel.create({
            userId,
            title: data.title,
            content: data.content,
            date: data.date ? new Date(data.date) : new Date(),
        });
    }

    async getJournalsByUserWithFilters(userId: string, options: ListJournalsOptions): Promise<IJournal[]> {
        const filter: Record<string, any> = { userId };

        if (options.q && options.q.trim().length > 0) {
            filter.title = { $regex: escapeRegex(options.q.trim()), $options: "i" };
        }

        if (options.startDate || options.endDate) {
            filter.date = {};
            if (options.startDate) filter.date.$gte = options.startDate;
            if (options.endDate) filter.date.$lte = options.endDate;
        }

        return JournalModel.find(filter).sort({ date: -1, createdAt: -1 }).exec();
    }

    async getJournalByIdForUser(userId: string, id: string): Promise<IJournal | null> {
        return JournalModel.findOne({ _id: id, userId }).exec();
    }

    async updateJournalForUser(userId: string, id: string, updates: UpdateJournalDTO): Promise<IJournal | null> {
        const updateData: any = {};
        if (updates.title) updateData.title = updates.title;
        if (updates.content) updateData.content = updates.content;
        if (updates.date) updateData.date = new Date(updates.date);
        return JournalModel.findOneAndUpdate({ _id: id, userId }, updateData, { new: true, runValidators: true }).exec();
    }

    async deleteJournalForUser(userId: string, id: string): Promise<IJournal | null> {
        return JournalModel.findOneAndDelete({ _id: id, userId }).exec();
    }
}