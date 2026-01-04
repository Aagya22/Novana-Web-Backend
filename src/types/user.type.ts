import z from "zod";

export const userSchema = z.object({
    fullName: z.string(),
    email: z.email(),
    phoneNumber: z.number().min(10).max(10),
    username: z.string().min(3).max(20),
    password: z.string().min(6),
    role: z.enum(['user','admin',"seller"]).default('user')
});

export type UserType = z.infer<typeof userSchema>;