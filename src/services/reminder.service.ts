import { CreateReminderDTO, UpdateReminderDTO } from "../dtos/reminder.dto";
import { HttpError } from "../errors/http-error";
import { ReminderRepository } from "../repositories/reminder.repository";
import { ReminderNotificationRepository } from "../repositories/reminder-notification.repository";

const reminderRepository = new ReminderRepository();
const reminderNotificationRepository = new ReminderNotificationRepository();

function parseHHmmToMinutes(hhmm: string): number | null {
    const m = (hhmm || "").match(/^(\d{2}):(\d{2})$/);
    if (!m) return null;
    const hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
    return hh * 60 + mm;
}

function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function isBetweenInclusive(date: Date, from: Date, to: Date) {
    const t = date.getTime();
    return t >= from.getTime() && t <= to.getTime();
}

export class ReminderService {

    async createReminder(userId: string, data: CreateReminderDTO) {
        return reminderRepository.createReminder(userId, data);
    }

    async getRemindersByUser(userId: string) {
        return reminderRepository.getRemindersByUser(userId);
    }

    async getReminderById(id: string) {
        const reminder = await reminderRepository.getReminderById(id);
        if (!reminder) {
            throw new HttpError(404, "Reminder not found");
        }
        return reminder;
    }

    async updateReminder(id: string, data: UpdateReminderDTO) {
        const reminder = await reminderRepository.updateReminder(id, data);
        if (!reminder) {
            throw new HttpError(404, "Reminder not found");
        }
        return reminder;
    }

    async deleteReminder(id: string) {
        const reminder = await reminderRepository.deleteReminder(id);
        if (!reminder) {
            throw new HttpError(404, "Reminder not found");
        }
        return reminder;
    }

    async toggleReminderDone(id: string) {
        const reminder = await reminderRepository.getReminderById(id);
        if (!reminder) {
            throw new HttpError(404, "Reminder not found");
        }
        // Toggle active/inactive reminders
        return reminderRepository.updateReminder(id, { enabled: !reminder.enabled });
    }

    async getNotificationHistory(userId: string, limit = 20) {
        return reminderNotificationRepository.listByUser(userId, limit);
    }

    async markNotificationRead(userId: string, id: string) {
        const updated = await reminderNotificationRepository.markRead(userId, id);
        if (!updated) throw new HttpError(404, "Notification not found");
        return updated;
    }

    async deleteNotification(userId: string, id: string) {
        const ok = await reminderNotificationRepository.deleteById(userId, id);
        if (!ok) throw new HttpError(404, "Notification not found");
        return true;
    }

    async clearNotificationHistory(userId: string) {
        return reminderNotificationRepository.deleteAllByUser(userId);
    }

    /**
     * Backfills reminder notifications that would have been delivered while the app was closed.
     * Creates at most one notification per (userId, reminderId, scheduledFor) because of the unique index.
     */
    async backfillMissedNotifications(userId: string, lookbackHours = 24) {
        const now = new Date();
        const lookbackMs = Math.max(0, lookbackHours) * 60 * 60 * 1000;
        const from = new Date(now.getTime() - lookbackMs);

        const reminders = await reminderRepository.getRemindersByUser(userId);

        // Consider today and yesterday; this covers late-night reminders after midnight.
        const dayStarts = [startOfDay(now), startOfDay(addDays(now, -1))];

        let createdCount = 0;
        for (const reminder of reminders) {
            if (!reminder.enabled) continue;

            const reminderMinutes = parseHHmmToMinutes(reminder.time);
            if (reminderMinutes === null) continue;

            const days = Array.isArray((reminder as any).daysOfWeek)
                ? (reminder as any).daysOfWeek
                : [0, 1, 2, 3, 4, 5, 6];

            for (const start of dayStarts) {
                const scheduledFor = new Date(start);
                scheduledFor.setHours(Math.floor(reminderMinutes / 60), reminderMinutes % 60, 0, 0);

                // Must match the day-of-week for that scheduledFor date.
                const dow = scheduledFor.getDay();
                if (days.length > 0 && !days.includes(dow)) continue;

                // Only backfill items in the lookback window and not in the future.
                if (!isBetweenInclusive(scheduledFor, from, now)) continue;

                const delivered = await reminderNotificationRepository.createIfNotExists({
                    userId,
                    reminderId: reminder._id.toString(),
                    title: reminder.title,
                    type: (reminder as any).type ?? "journal",
                    scheduledFor,
                });

                if (delivered) createdCount += 1;
            }
        }

        return createdCount;
    }

    /**
     * Returns newly delivered reminder notifications for the user.
     * Client is expected to poll (e.g. every 60s).
     */
    async deliverDueReminders(userId: string, windowMinutes = 2) {
        const now = new Date();
        const dow = now.getDay();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const startToday = startOfDay(now);

        const reminders = await reminderRepository.getRemindersByUser(userId);

        const newlyDelivered: any[] = [];
        for (const reminder of reminders) {
            if (!reminder.enabled) continue;

            const days = Array.isArray((reminder as any).daysOfWeek)
                ? (reminder as any).daysOfWeek
                : [0, 1, 2, 3, 4, 5, 6];
            if (days.length > 0 && !days.includes(dow)) continue;

            const reminderMinutes = parseHHmmToMinutes(reminder.time);
            if (reminderMinutes === null) continue;

            if (Math.abs(reminderMinutes - nowMinutes) > Math.max(0, windowMinutes)) continue;

            const scheduledFor = new Date(startToday);
            scheduledFor.setHours(Math.floor(reminderMinutes / 60), reminderMinutes % 60, 0, 0);

            const delivered = await reminderNotificationRepository.createIfNotExists({
                userId,
                reminderId: reminder._id.toString(),
                title: reminder.title,
                type: (reminder as any).type ?? "journal",
                scheduledFor,
            });

            if (delivered) {
                newlyDelivered.push(delivered);
            }
        }

        return newlyDelivered;
    }
}