import { CreateJournalDTO, UpdateJournalDTO } from "../dtos/journal.dto";
import { HttpError } from "../errors/http-error";
import { JournalRepository } from "../repositories/journal.repository";

const journalRepository = new JournalRepository();

export class JournalService {

    async createJournal(userId: string, data: CreateJournalDTO) {
        return journalRepository.createJournal(userId, data);
    }

    async getJournalsByUser(userId: string) {
        return journalRepository.getJournalsByUser(userId);
    }

    async getJournalById(id: string) {
        const journal = await journalRepository.getJournalById(id);
        if (!journal) {
            throw new HttpError(404, "Journal not found");
        }
        return journal;
    }

    async updateJournal(id: string, data: UpdateJournalDTO) {
        const journal = await journalRepository.updateJournal(id, data);
        if (!journal) {
            throw new HttpError(404, "Journal not found");
        }
        return journal;
    }

    async deleteJournal(id: string) {
        const journal = await journalRepository.deleteJournal(id);
        if (!journal) {
            throw new HttpError(404, "Journal not found");
        }
        return journal;
    }
}