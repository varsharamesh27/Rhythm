import { z } from "zod";

export const authEmailSchema = z.string().trim().email();

export const emailOtpSchema = z
  .string()
  .trim()
  .regex(/^\d{6,10}$/, "Enter the numeric code from the newest email.");
