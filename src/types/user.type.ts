import z from "zod";

export const UserSchema = z.object({
    fullName: z.string().min(1),
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    phoneNumber: z.string().min(10),
    role: z.enum(["user", "admin",]).default("user"),
});

export type UserType = z.infer<typeof UserSchema>;