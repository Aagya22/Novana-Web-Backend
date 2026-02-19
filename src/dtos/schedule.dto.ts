import { z } from "zod";

const DateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format");
const TimeHHmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "time must be in HH:mm format");


export const CreateScheduleDTO = z.object({
    title: z.string().min(1),
    date: DateKey,
    time: TimeHHmm,
    description: z.string().optional(),
    location: z.string().optional(),
});

export type CreateScheduleDTO = z.infer<typeof CreateScheduleDTO>;

export const UpdateScheduleDTO = z.object({
    title: z.string().min(1).optional(),
    date: DateKey.optional(),
    time: TimeHHmm.optional(),
    description: z.string().optional(),
    location: z.string().optional(),
});

export type UpdateScheduleDTO = z.infer<typeof UpdateScheduleDTO>;
