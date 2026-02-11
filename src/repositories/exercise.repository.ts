import { ExerciseModel, IExercise } from "../models/exercise.model";
import { CreateExerciseDTO, UpdateExerciseDTO } from "../dtos/exercise.dto";

export class ExerciseRepository {

    async createExercise(userId: string, data: CreateExerciseDTO): Promise<IExercise> {
        return ExerciseModel.create({
            userId,
            type: data.type,
            duration: data.duration,
            date: data.date ? new Date(data.date) : new Date(),
            notes: data.notes,
        });
    }

    async getExercisesByUser(userId: string): Promise<IExercise[]> {
        return ExerciseModel.find({ userId }).sort({ date: -1 }).exec();
    }

    async getExerciseById(id: string): Promise<IExercise | null> {
        return ExerciseModel.findById(id).exec();
    }

    async updateExercise(id: string, updates: UpdateExerciseDTO): Promise<IExercise | null> {
        const updateData: any = {};
        if (updates.type) updateData.type = updates.type;
        if (updates.duration) updateData.duration = updates.duration;
        if (updates.date) updateData.date = new Date(updates.date);
        if (updates.notes !== undefined) updateData.notes = updates.notes;
        return ExerciseModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async deleteExercise(id: string): Promise<IExercise | null> {
        return ExerciseModel.findByIdAndDelete(id).exec();
    }
}