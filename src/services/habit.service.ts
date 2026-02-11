import { CreateHabitDTO, UpdateHabitDTO } from "../dtos/habit.dto";
import { HttpError } from "../errors/http-error";
import { HabitRepository } from "../repositories/habit.repository";

const habitRepository = new HabitRepository();

export class HabitService {

    async createHabit(userId: string, data: CreateHabitDTO) {
        return habitRepository.createHabit(userId, data);
    }

    async getHabitsByUser(userId: string) {
        return habitRepository.getHabitsByUser(userId);
    }

    async getHabitById(id: string) {
        const habit = await habitRepository.getHabitById(id);
        if (!habit) {
            throw new HttpError(404, "Habit not found");
        }
        return habit;
    }

    async updateHabit(id: string, data: UpdateHabitDTO) {
        const habit = await habitRepository.updateHabit(id, data);
        if (!habit) {
            throw new HttpError(404, "Habit not found");
        }
        return habit;
    }

    async deleteHabit(id: string) {
        const habit = await habitRepository.deleteHabit(id);
        if (!habit) {
            throw new HttpError(404, "Habit not found");
        }
        return habit;
    }

    async markHabitCompleted(id: string) {
        const habit = await habitRepository.getHabitById(id);
        if (!habit) {
            throw new HttpError(404, "Habit not found");
        }
        const now = new Date();
        const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
        let newStreak = habit.streak;

        // Simple streak logic: if completed today, increment streak
        if (!lastCompleted || lastCompleted.toDateString() !== now.toDateString()) {
            newStreak += 1;
        }

        return habitRepository.updateHabit(id, { streak: newStreak, lastCompleted: now.toISOString() });
    }
}