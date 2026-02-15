import { CreateJournalDTO, UpdateJournalDTO } from "../dtos/journal.dto";
import { HttpError } from "../errors/http-error";
import { JournalRepository } from "../repositories/journal.repository";
import type { ListJournalsOptions } from "../repositories/journal.repository";

const journalRepository = new JournalRepository();

export class JournalService {

    async createJournal(userId: string, data: CreateJournalDTO) {
        return journalRepository.createJournal(userId, data);
    }

    async getJournalsByUser(userId: string) {
        return journalRepository.getJournalsByUser(userId);
    }

    async getJournalsByUserWithFilters(userId: string, options: ListJournalsOptions) {
        return journalRepository.getJournalsByUserWithFilters(userId, options);
    }

    async getJournalById(userId: string, id: string) {
        const journal = await journalRepository.getJournalByIdForUser(userId, id);
        if (!journal) {
            throw new HttpError(404, "Journal not found");
        }
        return journal;
    }

    async updateJournal(userId: string, id: string, data: UpdateJournalDTO) {
        const journal = await journalRepository.updateJournalForUser(userId, id, data);
        if (!journal) {
            throw new HttpError(404, "Journal not found");
        }
        return journal;
    }

    async deleteJournal(userId: string, id: string) {
        const journal = await journalRepository.deleteJournalForUser(userId, id);
        if (!journal) {
            throw new HttpError(404, "Journal not found");
        }
        return journal;
    }
}