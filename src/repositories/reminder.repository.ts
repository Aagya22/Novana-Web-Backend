import { ReminderModel, IReminder } from "../models/reminder.model";
import { CreateReminderDTO, UpdateReminderDTO } from "../dtos/reminder.dto";

function normalizeTimeToHHmm(input: string): string {
    const trimmed = (input || "").trim();
    // Already HH:mm
    if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;

    // Attempt parse formats like "7:00 AM", "7:00PM", "12:05 pm"
    const m = trimmed.match(/^\s*(\d{1,2})\s*:\s*(\d{2})\s*([AaPp][Mm])\s*$/);
    if (!m) return trimmed; // fallback; validation happens at DTO layer

    let hour = parseInt(m[1], 10);
    const minute = parseInt(m[2], 10);
    const ampm = m[3].toUpperCase();

    if (ampm === "AM") {
        if (hour === 12) hour = 0;
    } else {
        if (hour !== 12) hour += 12;
    }

    const hh = String(hour).padStart(2, "0");
    const mm = String(minute).padStart(2, "0");
    return `${hh}:${mm}`;
}

export class ReminderRepository {

    async createReminder(userId: string, data: CreateReminderDTO): Promise<IReminder> {
        return ReminderModel.create({
            userId,
            title: data.title,
            time: normalizeTimeToHHmm(data.time),
            type: data.type ?? "journal",
            daysOfWeek: data.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6],
            enabled: data.enabled ?? true,

            // Legacy
            date: data.date ? new Date(data.date) : new Date(),
            recurring: data.recurring ?? true,
        });
    }

    async getRemindersByUser(userId: string): Promise<IReminder[]> {
        // Active reminders are typically rendered by time; keep it stable.
        return ReminderModel.find({ userId }).sort({ time: 1 }).exec();
    }

    async getReminderById(id: string): Promise<IReminder | null> {
        return ReminderModel.findById(id).exec();
    }

    async updateReminder(id: string, updates: UpdateReminderDTO): Promise<IReminder | null> {
        const updateData: any = {};
        if (updates.title) updateData.title = updates.title;
        if (updates.time) updateData.time = normalizeTimeToHHmm(updates.time);
        if (updates.type) updateData.type = updates.type;
        if (updates.daysOfWeek !== undefined) updateData.daysOfWeek = updates.daysOfWeek;
        if (updates.enabled !== undefined) updateData.enabled = updates.enabled;

        // Legacy
        if (updates.date) updateData.date = new Date(updates.date);
        if (updates.recurring !== undefined) updateData.recurring = updates.recurring;
        return ReminderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async deleteReminder(id: string): Promise<IReminder | null> {
        return ReminderModel.findByIdAndDelete(id).exec();
    }
}