import z from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
    fullName: true,
    username: true,
    email: true,
    password: true,
    phoneNumber: true
}).extend({
    confirmPassword: z.string().min(8)
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;