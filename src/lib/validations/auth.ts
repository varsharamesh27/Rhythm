import { z } from "zod";

export const authEmailSchema = z.string().trim().email("Enter a valid email address.");

const personNameSchema = z.string().trim().min(1, "Enter a name.").max(80, "Names must contain 80 characters or fewer.");

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password must contain 128 characters or fewer.");

export const passwordSignInSchema = z.object({
  email: authEmailSchema,
  password: passwordSchema
});

export const passwordSignUpSchema = z
  .object({
    firstName: personNameSchema,
    lastName: personNameSchema,
    email: authEmailSchema,
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export const passwordResetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });
