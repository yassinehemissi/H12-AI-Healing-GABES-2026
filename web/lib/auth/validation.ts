import { z } from "zod"

import { USER_TYPES } from "@/lib/models/user"

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password is too long.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]/, "Password must include a number.")

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(120, "Full name is too long."),
    email: z.email("Please enter a valid email.").trim().toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string(),
    userType: z.enum(USER_TYPES, "Select a valid user type."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export const signInSchema = z.object({
  email: z.email("Please enter a valid email.").trim().toLowerCase(),
  password: z.string().min(1, "Password is required."),
  userType: z.enum(USER_TYPES, "Select a valid user type."),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>

export type AuthActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}
