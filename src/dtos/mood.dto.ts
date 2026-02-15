import { z } from "zod";

/* -------------------- CREATE MOOD -------------------- */
export const CreateMoodDTO = z.object({
    mood: z.number().min(1).max(10),
    moodType: z.string().min(1).optional(),
    note: z.string().optional(),
    date: z.string().optional(),
});

export type CreateMoodDTO = z.infer<typeof CreateMoodDTO>;

/* -------------------- UPDATE MOOD -------------------- */
export const UpdateMoodDTO = z.object({
    mood: z.number().min(1).max(10).optional(),
    moodType: z.string().min(1).optional(),
    note: z.string().optional(),
    date: z.string().optional(),
});

export type UpdateMoodDTO = z.infer<typeof UpdateMoodDTO>;