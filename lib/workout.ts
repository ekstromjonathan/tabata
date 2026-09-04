export type WorkoutMode = "tabata" | "interval" | "emom"

export const WORKOUT_MODES = ["tabata", "interval", "emom"] as const

export function isWorkoutMode(value: string): value is WorkoutMode {
  return value === "tabata" || value === "interval" || value === "emom"
}

export type Settings = {
  work: number
  rest: number
  exercises: number
  rounds: number
  roundRest: number
  intervalSec: number
}

export type PhaseKind = "work" | "rest" | "roundRest"

export type Phase = {
  kind: PhaseKind
  duration: number
  round: number
  exercise: number
}

export const DEFAULT_SETTINGS: Settings = {
  work: 20,
  rest: 10,
  exercises: 8,
  rounds: 1,
  roundRest: 60,
  intervalSec: 60,
}

export const SETTING_BOUNDS = {
  work: { min: 1, max: 600, suffix: "s" },
  rest: { min: 0, max: 300, suffix: "s" },
  exercises: { min: 1, max: 30, suffix: "" },
  rounds: { min: 1, max: 30, suffix: "" },
  roundRest: { min: 0, max: 600, suffix: "s" },
  intervalSec: { min: 5, max: 600, suffix: "s" },
} as const

export function clampSetting(
  key: keyof Settings,
  value: number
): number {
  const { min, max } = SETTING_BOUNDS[key]
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

function buildIntervalPhases(settings: Settings): Phase[] {
  const phases: Phase[] = []

  for (let round = 1; round <= settings.rounds; round++) {
    for (let exercise = 1; exercise <= settings.exercises; exercise++) {
      phases.push({
        kind: "work",
        duration: settings.work,
        round,
        exercise,
      })

      const lastExercise = exercise === settings.exercises
      const lastRound = round === settings.rounds

      if (!lastExercise && settings.rest > 0) {
        phases.push({
          kind: "rest",
          duration: settings.rest,
          round,
          exercise,
        })
      }

      if (lastExercise && !lastRound && settings.roundRest > 0) {
        phases.push({
          kind: "roundRest",
          duration: settings.roundRest,
          round,
          exercise,
        })
      }
    }
  }

  return phases
}

function buildEmomPhases(settings: Settings): Phase[] {
  const interval = clampSetting("intervalSec", settings.intervalSec)
  const work = clampSetting("work", settings.work)
  const phases: Phase[] = []

  for (let round = 1; round <= settings.rounds; round++) {
    for (let exercise = 1; exercise <= settings.exercises; exercise++) {
      if (work > 0 && work < interval) {
        phases.push({
          kind: "work",
          duration: work,
          round,
          exercise,
        })
        phases.push({
          kind: "rest",
          duration: interval - work,
          round,
          exercise,
        })
      } else {
        phases.push({
          kind: "work",
          duration: interval,
          round,
          exercise,
        })
      }
    }
  }

  return phases
}

export function buildPhases(
  settings: Settings,
  mode: WorkoutMode = "tabata"
): Phase[] {
  if (mode === "emom") return buildEmomPhases(settings)
  return buildIntervalPhases(settings)
}

export function totalSeconds(
  settings: Settings,
  mode: WorkoutMode = "tabata"
): number {
  return buildPhases(settings, mode).reduce((sum, phase) => sum + phase.duration, 0)
}

export function remainingAfterIndex(phases: Phase[], index: number): number {
  return phases.slice(index + 1).reduce((sum, phase) => sum + phase.duration, 0)
}

export function formatClock(total: number): string {
  const safe = Math.max(0, Math.round(total))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function displaySeconds(remainingMs: number): number {
  return Math.max(0, Math.ceil(remainingMs / 1000))
}

export function findWorkPhaseIndex(phases: Phase[], fromIndex: number): number {
  const current = phases[fromIndex]
  if (!current) return 0
  for (let index = fromIndex; index >= 0; index--) {
    const phase = phases[index]
    if (
      phase.kind === "work" &&
      phase.round === current.round &&
      phase.exercise === current.exercise
    ) {
      return index
    }
  }
  return fromIndex
}

const STORAGE_KEY = "tabata-settings"
const listeners = new Set<() => void>()
let memory: Settings | null = null

function parseSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS
  try {
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      work: clampSetting("work", parsed.work ?? DEFAULT_SETTINGS.work),
      rest: clampSetting("rest", parsed.rest ?? DEFAULT_SETTINGS.rest),
      exercises: clampSetting(
        "exercises",
        parsed.exercises ?? DEFAULT_SETTINGS.exercises
      ),
      rounds: clampSetting("rounds", parsed.rounds ?? DEFAULT_SETTINGS.rounds),
      roundRest: clampSetting(
        "roundRest",
        parsed.roundRest ?? DEFAULT_SETTINGS.roundRest
      ),
      intervalSec: clampSetting(
        "intervalSec",
        parsed.intervalSec ?? DEFAULT_SETTINGS.intervalSec
      ),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function subscribeSettings(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSettingsSnapshot(): Settings {
  if (memory) return memory
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  memory = parseSettings(window.localStorage.getItem(STORAGE_KEY))
  return memory
}

export function getServerSettingsSnapshot(): Settings {
  return DEFAULT_SETTINGS
}

export function saveSettings(next: Settings) {
  memory = next
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  listeners.forEach((listener) => listener())
}
