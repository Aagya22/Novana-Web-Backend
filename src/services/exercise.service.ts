import { CompleteGuidedExerciseDTO, CreateExerciseDTO, UpdateExerciseDTO } from "../dtos/exercise.dto";
import { HttpError } from "../errors/http-error";
import { ExerciseRepository } from "../repositories/exercise.repository";

const exerciseRepository = new ExerciseRepository();

export class ExerciseService {

    async createExercise(userId: string, data: CreateExerciseDTO) {
        return exerciseRepository.createExercise(userId, data);
    }

    async completeGuidedExercise(userId: string, data: CompleteGuidedExerciseDTO) {
        return exerciseRepository.completeGuidedExercise(userId, data);
    }

    async getGuidedHistory(userId: string, from?: Date, to?: Date) {
        return exerciseRepository.getGuidedHistoryByUser(userId, from, to);
    }

    async clearExerciseHistory(userId: string) {
        return exerciseRepository.deleteAllExercisesByUser(userId);
    }

    async getExercisesByUser(userId: string) {
        return exerciseRepository.getExercisesByUser(userId);
    }

    async getExerciseById(userId: string, id: string) {
        const exercise = await exerciseRepository.getExerciseByIdForUser(userId, id);
        if (!exercise) {
            throw new HttpError(404, "Exercise not found");
        }
        return exercise;
    }

    async updateExercise(userId: string, id: string, data: UpdateExerciseDTO) {
        const exercise = await exerciseRepository.updateExerciseForUser(userId, id, data);
        if (!exercise) {
            throw new HttpError(404, "Exercise not found");
        }
        return exercise;
    }

    async deleteExercise(userId: string, id: string) {
        const exercise = await exerciseRepository.deleteExerciseForUser(userId, id);
        if (!exercise) {
            throw new HttpError(404, "Exercise not found");
        }
        return exercise;
    }
}