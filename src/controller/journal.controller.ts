import { JournalService } from "../services/journal.service";
import { CreateJournalDTO, UpdateJournalDTO } from "../dtos/journal.dto";
import { Request, Response } from "express";

const journalService = new JournalService();

export class JournalController {

    async createJournal(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const parsedData = CreateJournalDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const journal = await journalService.createJournal(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                message: "Journal entry created successfully",
                data: journal
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getJournals(req: Request, res: Response) {
        try {
            const userId = req.user?._id?.toString();
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const journals = await journalService.getJournalsByUser(userId);
            return res.status(200).json({
                success: true,
                message: "Journals fetched successfully",
                data: journals
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getJournal(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const journal = await journalService.getJournalById(id);
            return res.status(200).json({
                success: true,
                message: "Journal fetched successfully",
                data: journal
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateJournal(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parsedData = UpdateJournalDTO.safeParse(req.body);
            if (!parsedData.success) {
                const messages = parsedData.error.issues.map(i => i.message).join(", ");
                return res.status(400).json({ success: false, message: messages });
            }

            const journal = await journalService.updateJournal(id, parsedData.data);
            return res.status(200).json({
                success: true,
                message: "Journal updated successfully",
                data: journal
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async deleteJournal(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await journalService.deleteJournal(id);
            return res.status(200).json({
                success: true,
                message: "Journal deleted successfully"
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}