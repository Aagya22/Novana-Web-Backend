import { z } from "zod";

/* -------------------- CREATE HABIT -------------------- */
export const CreateHabitDTO = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly']),
});

export type CreateHabitDTO = z.infer<typeof CreateHabitDTO>;

/* -------------------- UPDATE HABIT -------------------- */
export const UpdateHabitDTO = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    streak: z.number().optional(),
    lastCompleted: z.string().optional(),
});

export type UpdateHabitDTO = z.infer<typeof UpdateHabitDTO>;