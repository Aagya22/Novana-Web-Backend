import { z } from "zod";

// A short passcode used to unlock access to journal entries.
// Keep this intentionally separate from the user password.
const passcodeSchema = z
  .string()
  .trim()
  .min(1, "Passcode is required")
  .regex(/^\d{4,8}$/, "Passcode must be 4 to 8 digits");

const appPasswordSchema = z.string().min(1, "Password is required");

export const JournalPasscodeVerifyDTO = z.object({
  passcode: passcodeSchema,
});

export type JournalPasscodeVerifyDTO = z.infer<typeof JournalPasscodeVerifyDTO>;

export const JournalPasscodeSetDTO = z.object({
  passcode: passcodeSchema,
  password: appPasswordSchema,
});

export type JournalPasscodeSetDTO = z.infer<typeof JournalPasscodeSetDTO>;

export const JournalPasscodeClearDTO = z.object({
  password: appPasswordSchema,
});

export type JournalPasscodeClearDTO = z.infer<typeof JournalPasscodeClearDTO>;
