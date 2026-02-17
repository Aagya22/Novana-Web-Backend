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

/* -------------------- COMPLETE GUIDED EXERCISE -------------------- */
export const CompleteGuidedExerciseDTO = z.object({
    title: z.string().min(1),
    category: z.string().min(1),
    plannedDurationSeconds: z.number().int().min(1),
    elapsedSeconds: z.number().int().min(1),
    completedAt: z.string().optional(),
});

export type CompleteGuidedExerciseDTO = z.infer<typeof CompleteGuidedExerciseDTO>;