import { z } from "zod";

export const authEmailSchema = z.string().trim().email();

export const emailOtpSchema = z
  .string()
  .trim()
  .regex(/^\d{6,10}$/, "Enter the numeric code from the newest email.");

export const passwordSignInSchema = z.object({
  email: authEmailSchema,
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(128, "Password must contain 128 characters or fewer.")
});
