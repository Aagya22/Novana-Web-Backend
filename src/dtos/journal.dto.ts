import { z } from "zod";

/* -------------------- CREATE JOURNAL -------------------- */
export const CreateJournalDTO = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    date: z.string().optional(), // ISO date string
});

export type CreateJournalDTO = z.infer<typeof CreateJournalDTO>;

/* -------------------- UPDATE JOURNAL -------------------- */
export const UpdateJournalDTO = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    date: z.string().optional(),
});

export type UpdateJournalDTO = z.infer<typeof UpdateJournalDTO>;