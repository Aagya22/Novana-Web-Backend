import { z } from "zod";

/* -------------------- CREATE EXERCISE -------------------- */
export const CreateExerciseDTO = z.object({
    type: z.string().min(1),
    duration: z.number().min(1),
    date: z.string().optional(),
    notes: z.string().optional(),
});

export type CreateExerciseDTO = z.infer<typeof CreateExerciseDTO>;

/* -------------------- UPDATE EXERCISE -------------------- */
export const UpdateExerciseDTO = z.object({
    type: z.string().min(1).optional(),
    duration: z.number().min(1).optional(),
    date: z.string().optional(),
    notes: z.string().optional(),
});

export type UpdateExerciseDTO = z.infer<typeof UpdateExerciseDTO>;