import "server-only"

import { redirect } from "next/navigation"

import { connectToDatabase } from "@/lib/mongodb"
import { UserModel, type UserType } from "@/lib/models/user"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { readSession } from "@/lib/auth/session"

export async function createUser(input: {
  fullName: string
  email: string
  password: string
  userType: UserType
}) {
  await connectToDatabase()

  const existingUser = await UserModel.findOne({ email: input.email }).lean()
  if (existingUser) {
    return { error: "Email is already registered." as const }
  }

  const passwordHash = await hashPassword(input.password)

  const created = await UserModel.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    userType: input.userType,
    enterpriseSubscriptionActive: false,
  })

  return {
    user: {
      id: String(created._id),
      email: created.email,
      userType: created.userType as UserType,
      fullName: created.fullName,
      enterpriseSubscriptionActive: created.enterpriseSubscriptionActive,
    },
  }
}

export async function signInWithPassword(input: {
  email: string
  password: string
  userType: UserType
}) {
  await connectToDatabase()

  const user = await UserModel.findOne({ email: input.email })
  if (!user) {
    return { error: "Invalid email, password, or user type." as const }
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash)
  if (!passwordMatches) {
    return { error: "Invalid email, password, or user type." as const }
  }

  if (user.userType !== input.userType) {
    return { error: "Invalid email, password, or user type." as const }
  }

  return {
    user: {
      id: String(user._id),
      email: user.email,
      userType: user.userType as UserType,
      fullName: user.fullName,
      enterpriseSubscriptionActive: user.enterpriseSubscriptionActive,
    },
  }
}

export async function getCurrentUser() {
  const session = await readSession()

  if (!session?.userId) {
    return null
  }

  await connectToDatabase()
  const user = await UserModel.findById(session.userId).lean()

  if (!user) {
    return null
  }

  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    userType: user.userType as UserType,
    enterpriseSubscriptionActive: user.enterpriseSubscriptionActive,
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return user
}
