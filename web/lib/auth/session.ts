import "server-only"

import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { cookies } from "next/headers"

import type { UserType } from "@/lib/models/user"

const SESSION_COOKIE_NAME = "h12_session"
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret) {
  throw new Error("Missing SESSION_SECRET in environment variables")
}

const secretKey = new TextEncoder().encode(sessionSecret)

export type SessionPayload = JWTPayload & {
  userId: string
  email: string
  userType: UserType
}

export async function createSession(payload: {
  userId: string
  email: string
  userType: UserType
}) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey)

  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  })
}

export async function readSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secretKey, {
      algorithms: ["HS256"],
    })
    return payload
  } catch {
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
