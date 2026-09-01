"use server"

import { redirect } from "next/navigation"

import {
  createSession,
  clearSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth"
import { createUser, findUserByEmail, isSubscribed } from "@/lib/db"

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function signupAction(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  if (!validEmail(email)) return { error: "Skriv inn en gyldig e-post." }
  if (password.length < 8) return { error: "Passordet må ha minst 8 tegn." }
  const existing = await findUserByEmail(email)
  if (existing) return { error: "Den e-posten er allerede i bruk." }
  const user = await createUser(email, hashPassword(password))
  await createSession(user.id)
  redirect("/abonner")
}

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const user = await findUserByEmail(email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Feil e-post eller passord." }
  }
  await createSession(user.id)
  redirect(isSubscribed(user) ? "/timer" : "/abonner")
}

export async function logoutAction() {
  await clearSession()
  redirect("/")
}
