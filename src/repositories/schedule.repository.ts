import { ScheduleModel, ISchedule } from "../models/schedule.model";
import { CreateScheduleDTO, UpdateScheduleDTO } from "../dtos/schedule.dto";

export type ListSchedulesOptions = {
    q?: string;
    from?: string;
    to?: string;
};

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class ScheduleRepository {

    async createSchedule(userId: string, data: CreateScheduleDTO): Promise<ISchedule> {
        return ScheduleModel.create({
            userId,
            title: data.title,
            date: data.date,
            time: data.time,
            description: data.description,
            location: data.location,
        });
    }

    async getSchedulesByUser(userId: string, options: ListSchedulesOptions = {}): Promise<ISchedule[]> {
        const filter: Record<string, any> = { userId };

        if (options.q && options.q.trim().length > 0) {
            filter.title = { $regex: escapeRegex(options.q.trim()), $options: "i" };
        }

        if (options.from || options.to) {
            filter.date = {};
            if (options.from) filter.date.$gte = options.from;
            if (options.to) filter.date.$lte = options.to;
        }

        return ScheduleModel.find(filter).sort({ date: 1, time: 1, createdAt: 1 }).exec();
    }

    async getScheduleByIdForUser(userId: string, id: string): Promise<ISchedule | null> {
        return ScheduleModel.findOne({ _id: id, userId }).exec();
    }

    async updateScheduleForUser(userId: string, id: string, updates: UpdateScheduleDTO): Promise<ISchedule | null> {
        const updateData: any = {};
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.date !== undefined) updateData.date = updates.date;
        if (updates.time !== undefined) updateData.time = updates.time;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.location !== undefined) updateData.location = updates.location;

        return ScheduleModel.findOneAndUpdate({ _id: id, userId }, updateData, { new: true, runValidators: true }).exec();
    }

    async deleteScheduleForUser(userId: string, id: string): Promise<ISchedule | null> {
        return ScheduleModel.findOneAndDelete({ _id: id, userId }).exec();
    }
}
