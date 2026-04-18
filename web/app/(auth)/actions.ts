"use server"

import { redirect } from "next/navigation"

import { createUser, signInWithPassword } from "@/lib/auth/auth"
import { clearSession, createSession } from "@/lib/auth/session"
import {
  signInSchema,
  signUpSchema,
  type AuthActionState,
} from "@/lib/auth/validation"

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const validated = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    userType: formData.get("userType"),
  })

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
    }
  }

  const result = await createUser(validated.data)

  if ("error" in result) {
    return { error: result.error }
  }

  await createSession({
    userId: result.user.id,
    email: result.user.email,
    userType: result.user.userType,
  })

  redirect("/dashboard")
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const validated = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    userType: formData.get("userType"),
  })

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
    }
  }

  const result = await signInWithPassword(validated.data)

  if ("error" in result) {
    return { error: result.error }
  }

  await createSession({
    userId: result.user.id,
    email: result.user.email,
    userType: result.user.userType,
  })

  redirect("/dashboard")
}

export async function signOutAction() {
  await clearSession()
  redirect("/sign-in")
}
