import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

import { findUserById, type User } from "@/lib/db"

const COOKIE = "tabata_session"

function secret() {
  const value = process.env.AUTH_SECRET ?? "tabata-dev-secret-change-me"
  return new TextEncoder().encode(value)
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const next = scryptSync(password, salt, 64)
  const prev = Buffer.from(hash, "hex")
  if (prev.length !== next.length) return false
  return timingSafeEqual(prev, next)
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret())
  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function clearSession() {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function getSessionUserId() {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    return typeof payload.sub === "string" ? payload.sub : null
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const id = await getSessionUserId()
  if (!id) return null
  return findUserById(id)
}
