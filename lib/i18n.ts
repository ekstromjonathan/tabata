export type Locale = "nb" | "sv" | "en"

export type Messages = {
  timer: string
  work: string
  workHint: string
  rest: string
  restHint: string
  exercises: string
  exercisesHint: string
  rounds: string
  roundRest: string
  roundRestHint: string
  total: string
  start: string
  pause: string
  resume: string
  end: string
  done: string
  niceWork: string
  again: string
  settings: string
  restartExercise: string
  roundPause: string
  round: string
  exercise: string
  language: string
  theme: string
  themeLight: string
  themeDark: string
  themeCustom: string
  decrease: string
  increase: string
  interval: string
  intervalHint: string
  emom: string
  intervalMode: string
  emomHint: string
}

export const LOCALES: { id: Locale; code: string; name: string }[] = [
  { id: "nb", code: "NB", name: "Norsk" },
  { id: "sv", code: "SV", name: "Svenska" },
  { id: "en", code: "EN", name: "English" },
]

export const MESSAGES: Record<Locale, Messages> = {
  nb: {
    timer: "Timer",
    work: "Arbeid",
    workHint: "Aktive sekunder",
    rest: "Hvile",
    restHint: "Mellom øvelser",
    exercises: "Øvelser",
    exercisesHint: "Per runde",
    rounds: "Runder",
    roundRest: "Mellom runder",
    roundRestHint: "Brukes ved flere runder",
    total: "totalt",
    start: "Start",
    pause: "Pause",
    resume: "Fortsett",
    end: "Avslutt",
    done: "Ferdig",
    niceWork: "Bra jobba",
    again: "Igjen",
    settings: "Innstillinger",
    restartExercise: "Øvelse på nytt",
    roundPause: "Rundepause",
    round: "Runde",
    exercise: "Øvelse",
    language: "Språk",
    theme: "Tema",
    themeLight: "Lys",
    themeDark: "Mørk",
    themeCustom: "Egen",
    decrease: "Reduser",
    increase: "Øk",
    interval: "Intervall",
    intervalHint: "Per minutt",
    emom: "EMOM",
    intervalMode: "Intervall",
    emomHint: "Reps, så hvile ut minuttet",
  },
  sv: {
    timer: "Timer",
    work: "Arbete",
    workHint: "Aktiva sekunder",
    rest: "Vila",
    restHint: "Mellan övningar",
    exercises: "Övningar",
    exercisesHint: "Per runda",
    rounds: "Rundor",
    roundRest: "Mellan rundor",
    roundRestHint: "Används vid flera rundor",
    total: "totalt",
    start: "Starta",
    pause: "Paus",
    resume: "Fortsätt",
    end: "Avsluta",
    done: "Klar",
    niceWork: "Bra jobbat",
    again: "Igen",
    settings: "Inställningar",
    restartExercise: "Övning på nytt",
    roundPause: "Rundpaus",
    round: "Runda",
    exercise: "Övning",
    language: "Språk",
    theme: "Tema",
    themeLight: "Ljust",
    themeDark: "Mörkt",
    themeCustom: "Egen",
    decrease: "Minska",
    increase: "Öka",
    interval: "Intervall",
    intervalHint: "Per minut",
    emom: "EMOM",
    intervalMode: "Intervall",
    emomHint: "Reps, sedan vila ut minuten",
  },
  en: {
    timer: "Timer",
    work: "Work",
    workHint: "Active seconds",
    rest: "Rest",
    restHint: "Between exercises",
    exercises: "Exercises",
    exercisesHint: "Per round",
    rounds: "Rounds",
    roundRest: "Between rounds",
    roundRestHint: "Used with multiple rounds",
    total: "total",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    end: "End",
    done: "Done",
    niceWork: "Nice work",
    again: "Again",
    settings: "Settings",
    restartExercise: "Restart exercise",
    roundPause: "Round rest",
    round: "Round",
    exercise: "Exercise",
    language: "Language",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeCustom: "Custom",
    decrease: "Decrease",
    increase: "Increase",
    interval: "Interval",
    intervalHint: "Per minute",
    emom: "EMOM",
    intervalMode: "Interval",
    emomHint: "Reps, then rest the rest of the minute",
  },
}

const STORAGE_KEY = "tabata-locale"
const listeners = new Set<() => void>()
let memory: Locale | null = null

function isLocale(value: string | null): value is Locale {
  return value === "nb" || value === "sv" || value === "en"
}

export function subscribeLocale(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getLocaleSnapshot(): Locale {
  if (memory) return memory
  if (typeof window === "undefined") return "nb"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  memory = isLocale(stored) ? stored : "nb"
  return memory
}

export function getServerLocaleSnapshot(): Locale {
  return "nb"
}

export function saveLocale(next: Locale) {
  memory = next
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
  }
  listeners.forEach((listener) => listener())
}
