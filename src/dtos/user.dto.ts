import { z } from "zod";
import { UserSchema } from "../types/user.type";

/* -------------------- CREATE USER -------------------- */
export const CreateUserDTO = UserSchema.pick({
  fullName: true,
  username: true,
  email: true,
  password: true,
  phoneNumber: true,
  imageUrl:true
}).extend({
  confirmPassword: z.string().min(8),
  
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

/* -------------------- LOGIN -------------------- */
export const LoginUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  // loginAs: z.enum(["user", "admin"]),
});

export type LoginUserDto = z.infer<typeof LoginUserDTO>;

/* -------------------- UPDATE USER -------------------- */
export const UpdateUserDto = UserSchema
  .pick({
    fullName: true,
    username: true,
    email: true,
    phoneNumber: true,
    password: true,
    imageUrl: true,
  })
  .partial();

export type UpdateUserDto = z.infer<typeof UpdateUserDto>;