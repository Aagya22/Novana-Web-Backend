import { z } from "zod";

const ReminderTypeEnum = z.enum(["journal", "mood", "exercise"]);

const DaysOfWeekSchema = z
    .array(z.number().int().min(0).max(6))
    .max(7)
    .optional();

/* -------------------- CREATE REMINDER -------------------- */
export const CreateReminderDTO = z.object({
    title: z.string().min(1),
    // Accept both legacy ("7:00 AM") and canonical ("07:30") formats.
    time: z.string().min(1),
    // New fields
    type: ReminderTypeEnum.optional(),
    daysOfWeek: DaysOfWeekSchema,
    enabled: z.boolean().optional(),
    // Legacy fields (kept for backward compatibility)
    date: z.string().optional(),
    recurring: z.boolean().optional(),
});

export type CreateReminderDTO = z.infer<typeof CreateReminderDTO>;

/* -------------------- UPDATE REMINDER -------------------- */
export const UpdateReminderDTO = z.object({
    title: z.string().min(1).optional(),
    time: z.string().min(1).optional(),
    // New fields
    type: ReminderTypeEnum.optional(),
    daysOfWeek: DaysOfWeekSchema,
    enabled: z.boolean().optional(),
    // Legacy fields (kept for backward compatibility)
    date: z.string().optional(),
    recurring: z.boolean().optional(),
});

export type UpdateReminderDTO = z.infer<typeof UpdateReminderDTO>;