import { z } from "zod";

/* -------------------- CREATE REMINDER -------------------- */
export const CreateReminderDTO = z.object({
    title: z.string().min(1),
    time: z.string().min(1), // e.g., "7:00 AM"
    date: z.string().optional(),
    recurring: z.boolean().optional(),
});

export type CreateReminderDTO = z.infer<typeof CreateReminderDTO>;

/* -------------------- UPDATE REMINDER -------------------- */
export const UpdateReminderDTO = z.object({
    title: z.string().min(1).optional(),
    time: z.string().min(1).optional(),
    done: z.boolean().optional(),
    date: z.string().optional(),
    recurring: z.boolean().optional(),
});

export type UpdateReminderDTO = z.infer<typeof UpdateReminderDTO>;