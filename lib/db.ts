import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { createClient, type Client } from "@libsql/client"

export type User = {
  id: string
  email: string
  passwordHash: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscriptionStatus: string
  currentPeriodEnd: number | null
  createdAt: number
}

let client: Client | null = null
let ready = false

function getClient() {
  if (client) return client
  const url = process.env.DATABASE_URL ?? "file:data/tabata.db"
  if (url.startsWith("file:")) {
    const filePath = url.slice("file:".length)
    mkdirSync(dirname(filePath), { recursive: true })
  }
  client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  })
  return client
}

export async function ensureDb() {
  const db = getClient()
  if (ready) return db
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      subscription_status TEXT NOT NULL DEFAULT 'none',
      current_period_end INTEGER,
      created_at INTEGER NOT NULL
    )
  `)
  ready = true
  return db
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    stripeCustomerId: (row.stripe_customer_id as string | null) ?? null,
    stripeSubscriptionId: (row.stripe_subscription_id as string | null) ?? null,
    subscriptionStatus: String(row.subscription_status),
    currentPeriodEnd:
      row.current_period_end == null ? null : Number(row.current_period_end),
    createdAt: Number(row.created_at),
  }
}

export async function createUser(email: string, passwordHash: string) {
  const db = await ensureDb()
  const user: User = {
    id: crypto.randomUUID(),
    email: email.toLowerCase().trim(),
    passwordHash,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: "none",
    currentPeriodEnd: null,
    createdAt: Date.now(),
  }
  await db.execute({
    sql: `INSERT INTO users (id, email, password_hash, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      user.id,
      user.email,
      user.passwordHash,
      user.stripeCustomerId,
      user.stripeSubscriptionId,
      user.subscriptionStatus,
      user.currentPeriodEnd,
      user.createdAt,
    ],
  })
  return user
}

export async function findUserByEmail(email: string) {
  const db = await ensureDb()
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email.toLowerCase().trim()],
  })
  const row = result.rows[0]
  return row ? mapUser(row as Record<string, unknown>) : null
}

export async function findUserById(id: string) {
  const db = await ensureDb()
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [id],
  })
  const row = result.rows[0]
  return row ? mapUser(row as Record<string, unknown>) : null
}

export async function findUserByCustomerId(customerId: string) {
  const db = await ensureDb()
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE stripe_customer_id = ?",
    args: [customerId],
  })
  const row = result.rows[0]
  return row ? mapUser(row as Record<string, unknown>) : null
}

export async function updateUser(
  id: string,
  patch: Partial<
    Pick<
      User,
      | "stripeCustomerId"
      | "stripeSubscriptionId"
      | "subscriptionStatus"
      | "currentPeriodEnd"
    >
  >
) {
  const current = await findUserById(id)
  if (!current) return null
  const next = { ...current, ...patch }
  const db = await ensureDb()
  await db.execute({
    sql: `UPDATE users SET
      stripe_customer_id = ?,
      stripe_subscription_id = ?,
      subscription_status = ?,
      current_period_end = ?
      WHERE id = ?`,
    args: [
      next.stripeCustomerId,
      next.stripeSubscriptionId,
      next.subscriptionStatus,
      next.currentPeriodEnd,
      id,
    ],
  })
  return next
}

export function isSubscribed(user: User | null) {
  if (!user) return false
  if (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing") {
    return true
  }
  if (user.subscriptionStatus === "past_due" && user.currentPeriodEnd) {
    return user.currentPeriodEnd * 1000 > Date.now()
  }
  return false
}
