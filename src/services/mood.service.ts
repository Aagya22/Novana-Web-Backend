import { CreateMoodDTO, UpdateMoodDTO } from "../dtos/mood.dto";
import { HttpError } from "../errors/http-error";
import { MoodRepository } from "../repositories/mood.repository";

const moodRepository = new MoodRepository();

export class MoodService {

    async createMood(userId: string, data: CreateMoodDTO) {
        return moodRepository.createMood(userId, data);
    }

    async getMoodsByUser(userId: string) {
        return moodRepository.getMoodsByUser(userId);
    }

    async getMoodById(id: string) {
        const mood = await moodRepository.getMoodById(id);
        if (!mood) {
            throw new HttpError(404, "Mood entry not found");
        }
        return mood;
    }

    async updateMood(id: string, data: UpdateMoodDTO) {
        const mood = await moodRepository.updateMood(id, data);
        if (!mood) {
            throw new HttpError(404, "Mood entry not found");
        }
        return mood;
    }

    async deleteMood(id: string) {
        const mood = await moodRepository.deleteMood(id);
        if (!mood) {
            throw new HttpError(404, "Mood entry not found");
        }
        return mood;
    }
}