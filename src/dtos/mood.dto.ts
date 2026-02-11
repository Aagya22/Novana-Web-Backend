import { z } from "zod";

/* -------------------- CREATE MOOD -------------------- */
export const CreateMoodDTO = z.object({
    mood: z.number().min(1).max(10),
    note: z.string().optional(),
    date: z.string().optional(),
});

export type CreateMoodDTO = z.infer<typeof CreateMoodDTO>;

/* -------------------- UPDATE MOOD -------------------- */
export const UpdateMoodDTO = z.object({
    mood: z.number().min(1).max(10).optional(),
    note: z.string().optional(),
    date: z.string().optional(),
});

export type UpdateMoodDTO = z.infer<typeof UpdateMoodDTO>;