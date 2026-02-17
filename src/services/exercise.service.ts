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

    async getExercisesByUser(userId: string) {
        return exerciseRepository.getExercisesByUser(userId);
    }

    async getExerciseById(id: string) {
        const exercise = await exerciseRepository.getExerciseById(id);
        if (!exercise) {
            throw new HttpError(404, "Exercise not found");
        }
        return exercise;
    }

    async updateExercise(id: string, data: UpdateExerciseDTO) {
        const exercise = await exerciseRepository.updateExercise(id, data);
        if (!exercise) {
            throw new HttpError(404, "Exercise not found");
        }
        return exercise;
    }

    async deleteExercise(id: string) {
        const exercise = await exerciseRepository.deleteExercise(id);
        if (!exercise) {
            throw new HttpError(404, "Exercise not found");
        }
        return exercise;
    }
}