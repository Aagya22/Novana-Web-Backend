import { CreateScheduleDTO, UpdateScheduleDTO } from "../dtos/schedule.dto";
import { HttpError } from "../errors/http-error";
import { ScheduleRepository, ListSchedulesOptions } from "../repositories/schedule.repository";

const scheduleRepository = new ScheduleRepository();

export class ScheduleService {

    async createSchedule(userId: string, data: CreateScheduleDTO) {
        return scheduleRepository.createSchedule(userId, data);
    }

    async getSchedulesByUser(userId: string, options: ListSchedulesOptions) {
        return scheduleRepository.getSchedulesByUser(userId, options);
    }

    async getScheduleById(userId: string, id: string) {
        const schedule = await scheduleRepository.getScheduleByIdForUser(userId, id);
        if (!schedule) {
            throw new HttpError(404, "Schedule not found");
        }
        return schedule;
    }

    async updateSchedule(userId: string, id: string, updates: UpdateScheduleDTO) {
        const updated = await scheduleRepository.updateScheduleForUser(userId, id, updates);
        if (!updated) {
            throw new HttpError(404, "Schedule not found");
        }
        return updated;
    }

    async deleteSchedule(userId: string, id: string) {
        const deleted = await scheduleRepository.deleteScheduleForUser(userId, id);
        if (!deleted) {
            throw new HttpError(404, "Schedule not found");
        }
        return deleted;
    }
}
