import {
  DEFAULT_SETTINGS,
  clampSetting,
  isWorkoutMode,
  type Settings,
  type WorkoutMode,
} from "@/lib/workout"

export const TITLE_MAX_LENGTH = 80

export type SessionSettings = {
  work: number
  rest: number
  exercises: number
  rounds: number
  roundRest: number
  intervalSec: number
}

export type SessionResult = {
  ok: true
  mode: WorkoutMode
  title: string | null
  settings: SessionSettings
  autoStart: boolean
  url: string
}

export type SessionError = {
  ok: false
  error: string
}

export type QuerySession = {
  mode?: WorkoutMode
  title?: string
  settings?: Partial<Settings>
  autoStart?: boolean
}

type SettingKey = keyof Settings

const SETTING_ALIASES: Record<string, SettingKey> = {
  work: "work",
  rest: "rest",
  exercises: "exercises",
  rounds: "rounds",
  round_rest: "roundRest",
  roundRest: "roundRest",
  interval_sec: "intervalSec",
  intervalSec: "intervalSec",
}

function firstValue(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export function flattenSearchParams(
  params: Record<string, string | string[] | undefined>
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    const first = firstValue(value)
    if (first !== undefined) out[key] = first
  }
  return out
}

function readNumber(
  raw: unknown,
  field: string,
  strict: boolean
): { ok: true; value: number | undefined } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: undefined }
  }
  if (typeof raw === "boolean") {
    return strict
      ? { ok: false, error: `Invalid ${field}. Use a number.` }
      : { ok: true, value: undefined }
  }
  const n = typeof raw === "number" ? raw : Number(String(raw).trim())
  if (!Number.isFinite(n)) {
    return strict
      ? { ok: false, error: `Invalid ${field}. Use a number.` }
      : { ok: true, value: undefined }
  }
  return { ok: true, value: n }
}

function readBoolean(
  raw: unknown,
  field: string,
  strict: boolean
): { ok: true; value: boolean | undefined } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: undefined }
  }
  if (raw === true || raw === 1 || raw === "1" || raw === "true") {
    return { ok: true, value: true }
  }
  if (raw === false || raw === 0 || raw === "0" || raw === "false") {
    return { ok: true, value: false }
  }
  return strict
    ? { ok: false, error: `Invalid ${field}. Use true, false, 1, or 0.` }
    : { ok: true, value: undefined }
}

function readTitle(
  raw: unknown,
  strict: boolean
): { ok: true; value: string | undefined } | { ok: false; error: string } {
  if (raw === undefined || raw === null) return { ok: true, value: undefined }
  if (typeof raw !== "string") {
    return strict
      ? { ok: false, error: "Invalid title. Use a short string." }
      : { ok: true, value: undefined }
  }
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim()
  if (!cleaned) return { ok: true, value: undefined }
  return { ok: true, value: cleaned.slice(0, TITLE_MAX_LENGTH) }
}

function readMode(
  raw: unknown,
  strict: boolean
): { ok: true; value: WorkoutMode | undefined } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: undefined }
  }
  if (typeof raw !== "string" || !isWorkoutMode(raw)) {
    return strict
      ? {
          ok: false,
          error: 'Invalid mode. Use "tabata", "interval", or "emom".',
        }
      : { ok: true, value: undefined }
  }
  return { ok: true, value: raw }
}

export type ParsedSession = {
  ok: true
  query: QuerySession
  settings: Settings
}

export function parseSessionInput(
  raw: Record<string, unknown>,
  options: { strict: boolean; base?: Settings }
): ParsedSession | SessionError {
  const strict = options.strict
  const settings = { ...(options.base ?? DEFAULT_SETTINGS) }
  const query: QuerySession = {}

  const modeRead = readMode(raw.mode, strict)
  if (!modeRead.ok) return modeRead
  if (modeRead.value) {
    query.mode = modeRead.value
  }

  const titleRead = readTitle(raw.title, strict)
  if (!titleRead.ok) return titleRead
  if (titleRead.value) {
    query.title = titleRead.value
  }

  const autoRead = readBoolean(raw.auto_start ?? raw.autoStart, "auto_start", strict)
  if (!autoRead.ok) return autoRead
  if (autoRead.value !== undefined) {
    query.autoStart = autoRead.value
  }

  const provided: Partial<Record<SettingKey, true>> = {}
  for (const [alias, key] of Object.entries(SETTING_ALIASES)) {
    if (!(alias in raw)) continue
    const parsed = readNumber(raw[alias], alias, strict)
    if (!parsed.ok) return parsed
    if (parsed.value === undefined) continue
    settings[key] = clampSetting(key, parsed.value)
    provided[key] = true
    query.settings = query.settings ?? {}
    query.settings[key] = settings[key]
  }

  const mode = query.mode ?? "tabata"
  if (mode === "emom") {
    if (!provided.intervalSec) {
      settings.intervalSec = clampSetting(
        "intervalSec",
        settings.intervalSec || DEFAULT_SETTINGS.intervalSec
      )
      if (strict) {
        query.settings = query.settings ?? {}
        query.settings.intervalSec = settings.intervalSec
      }
    }
    if (!provided.work) {
      settings.work = settings.intervalSec
      if (strict) {
        query.settings = query.settings ?? {}
        query.settings.work = settings.work
      }
    } else {
      settings.work = Math.min(
        settings.work,
        settings.intervalSec
      )
      query.settings = query.settings ?? {}
      query.settings.work = settings.work
    }
  }

  return { ok: true, query, settings }
}

export function requestOrigin(request: Request): string {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim()
  const host =
    forwardedHost || request.headers.get("host")?.trim() || undefined
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
  const proto =
    forwardedProto ||
    (host?.startsWith("localhost") || host?.startsWith("127.")
      ? "http"
      : "https")

  if (host) return `${proto}://${host}`

  const env = process.env.APP_URL?.replace(/\/$/, "")
  if (env) return env

  try {
    return new URL(request.url).origin
  } catch {
    return "http://127.0.0.1:43173"
  }
}

export function buildGuestUrl(
  origin: string,
  input: {
    mode: WorkoutMode
    title: string | null
    settings: Settings
    autoStart: boolean
  }
): string {
  const params = new URLSearchParams()
  params.set("mode", input.mode)
  params.set("work", String(input.settings.work))
  params.set("rest", String(input.settings.rest))
  params.set("exercises", String(input.settings.exercises))
  params.set("rounds", String(input.settings.rounds))
  params.set("round_rest", String(input.settings.roundRest))
  if (input.mode === "emom") {
    params.set("interval_sec", String(input.settings.intervalSec))
  }
  if (input.title) params.set("title", input.title)
  params.set("auto_start", input.autoStart ? "1" : "0")
  return `${origin.replace(/\/$/, "")}/tabata?${params.toString()}`
}

export function toSessionResult(
  origin: string,
  query: QuerySession,
  settings: Settings
): SessionResult {
  const mode = query.mode ?? "tabata"
  const title = query.title ?? null
  const autoStart = query.autoStart ?? false
  return {
    ok: true,
    mode,
    title,
    settings: {
      work: settings.work,
      rest: settings.rest,
      exercises: settings.exercises,
      rounds: settings.rounds,
      roundRest: settings.roundRest,
      intervalSec: settings.intervalSec,
    },
    autoStart,
    url: buildGuestUrl(origin, {
      mode,
      title,
      settings,
      autoStart,
    }),
  }
}

export function parseApiBody(
  raw: Record<string, unknown>,
  origin: string
): SessionResult | SessionError {
  const parsed = parseSessionInput(raw, {
    strict: true,
    base: DEFAULT_SETTINGS,
  })
  if (!parsed.ok) return parsed
  return toSessionResult(origin, parsed.query, parsed.settings)
}
