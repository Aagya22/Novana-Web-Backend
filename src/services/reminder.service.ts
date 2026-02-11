import { CreateReminderDTO, UpdateReminderDTO } from "../dtos/reminder.dto";
import { HttpError } from "../errors/http-error";
import { ReminderRepository } from "../repositories/reminder.repository";

const reminderRepository = new ReminderRepository();

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
        return reminderRepository.updateReminder(id, { done: !reminder.done });
    }
}