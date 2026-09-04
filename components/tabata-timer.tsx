"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Pause, Play, RotateCcw } from "lucide-react"

import { Confetti } from "@/components/confetti"
import { CountRing } from "@/components/count-ring"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SpotifyEmbed } from "@/components/spotify-embed"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { StepperRow } from "@/components/stepper-row"
import { TimerRing } from "@/components/timer-ring"
import { Button } from "@/components/ui/button"
import { tabataAudio } from "@/lib/audio"
import { parseSpotify, type SpotifyRef } from "@/lib/spotify"
import type { QuerySession } from "@/lib/session"
import {
  MESSAGES,
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  saveLocale,
  subscribeLocale,
  type Messages,
} from "@/lib/i18n"
import { PRODUCT } from "@/lib/product-i18n"
import { cn } from "@/lib/utils"
import {
  SETTING_BOUNDS,
  buildPhases,
  clampSetting,
  displaySeconds,
  findWorkPhaseIndex,
  formatClock,
  getServerSettingsSnapshot,
  getSettingsSnapshot,
  remainingAfterIndex,
  saveSettings,
  subscribeSettings,
  totalSeconds,
  isWorkoutMode,
  type Phase,
  type Settings,
  type WorkoutMode,
} from "@/lib/workout"

const GUEST_SESSION_KEY = "tabata-guest-session"

type StoredGuest = {
  mode?: string
  title?: string | null
  spotify?: string | null
}

function readStoredGuest(): StoredGuest | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(GUEST_SESSION_KEY)
    return raw ? (JSON.parse(raw) as StoredGuest) : null
  } catch {
    return null
  }
}

function writeStoredGuest(next: StoredGuest) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(next))
}

type Status = "setup" | "running" | "paused" | "done"

const PHASE_COLOR = {
  work: "#ff9f0a",
  rest: "#30d158",
  roundRest: "#64d2ff",
} as const

export function TabataTimer({
  accountHref,
  guest = false,
  query,
}: {
  accountHref?: string
  guest?: boolean
  query?: QuerySession
}) {
  const settings = useSyncExternalStore(
    subscribeSettings,
    getSettingsSnapshot,
    getServerSettingsSnapshot
  )
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot
  )
  const copy = MESSAGES[locale]
  const [status, setStatus] = useState<Status>("setup")
  const [phases, setPhases] = useState<Phase[]>([])
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [remainingMs, setRemainingMs] = useState(0)
  const [mode, setMode] = useState<WorkoutMode>(query?.mode ?? "tabata")
  const [title, setTitle] = useState<string | null>(query?.title ?? null)
  const [spotify, setSpotify] = useState<SpotifyRef | null>(
    query?.spotify ?? null
  )
  const appliedQueryRef = useRef(false)

  const phaseIndexRef = useRef(0)
  const phaseEndRef = useRef(0)
  const lastBeepRef = useRef<number | null>(null)
  const phasesRef = useRef<Phase[]>([])
  const runningRef = useRef(false)

  useEffect(() => {
    phasesRef.current = phases
  }, [phases])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const duration = useMemo(() => totalSeconds(settings, mode), [settings, mode])
  const phase = phases[phaseIndex]
  const seconds = displaySeconds(remainingMs)
  const inLastFiveOfPhase = seconds <= 5 && seconds >= 1
  const sessionLeftMs =
    remainingMs + remainingAfterIndex(phases, phaseIndex) * 1000
  const inLastFiveOfSession = sessionLeftMs > 0 && sessionLeftMs <= 5000

  const update = useCallback(
    (key: keyof Settings, value: number) => {
      saveSettings({
        ...settings,
        [key]: clampSetting(key, value),
      })
    },
    [settings]
  )

  const playPhaseCue = useCallback((kind: Phase["kind"]) => {
    if (kind === "work") tabataAudio.work()
    else if (kind === "rest") tabataAudio.rest()
    else tabataAudio.roundRest()
  }, [])

  const finish = useCallback(() => {
    runningRef.current = false
    setStatus("done")
    setRemainingMs(0)
    tabataAudio.complete()
  }, [])

  const beginPhase = useCallback(
    (index: number, list: Phase[], fromMs?: number) => {
      const next = list[index]
      if (!next) {
        finish()
        return
      }
      const ms = fromMs ?? next.duration * 1000
      phaseIndexRef.current = index
      phaseEndRef.current = Date.now() + ms
      lastBeepRef.current = null
      setPhaseIndex(index)
      setRemainingMs(ms)
      if (fromMs === undefined) playPhaseCue(next.kind)
    },
    [finish, playPhaseCue]
  )

  const startWorkout = useCallback(
    async (nextSettings: Settings, nextMode: WorkoutMode) => {
      await Promise.race([
        tabataAudio.unlock(),
        new Promise<void>((resolve) => window.setTimeout(resolve, 400)),
      ])
      const list = buildPhases(nextSettings, nextMode)
      if (list.length === 0) return
      setPhases(list)
      phasesRef.current = list
      runningRef.current = true
      setStatus("running")
      beginPhase(0, list)
    },
    [beginPhase]
  )

  const start = useCallback(() => {
    return startWorkout(settings, mode)
  }, [mode, settings, startWorkout])

  const pause = useCallback(() => {
    runningRef.current = false
    setStatus("paused")
    setRemainingMs(Math.max(0, phaseEndRef.current - Date.now()))
  }, [])

  const resume = useCallback(async () => {
    await tabataAudio.unlock()
    const left = Math.max(0, remainingMs)
    runningRef.current = true
    setStatus("running")
    beginPhase(phaseIndexRef.current, phasesRef.current, left)
  }, [beginPhase, remainingMs])

  const reset = useCallback(() => {
    runningRef.current = false
    setStatus("setup")
    setPhases([])
    setPhaseIndex(0)
    setRemainingMs(0)
    lastBeepRef.current = null
  }, [])

  const restartExercise = useCallback(async () => {
    await tabataAudio.unlock()
    const list = phasesRef.current
    const workIndex = findWorkPhaseIndex(list, phaseIndexRef.current)
    runningRef.current = true
    setStatus("running")
    beginPhase(workIndex, list)
  }, [beginPhase])

  useEffect(() => {
    if (status !== "running") return

    let frame = 0
    const tick = () => {
      if (!runningRef.current) return
      const left = Math.max(0, phaseEndRef.current - Date.now())
      setRemainingMs(left)

      const sec = displaySeconds(left)
      const list = phasesRef.current
      const index = phaseIndexRef.current
      const sessionLeft = left + remainingAfterIndex(list, index) * 1000

      if (sec >= 1 && sec <= 5 && lastBeepRef.current !== sec) {
        lastBeepRef.current = sec
        tabataAudio.countdown(sec, sessionLeft <= 5000)
      }

      if (left <= 0) {
        const nextIndex = index + 1
        if (nextIndex >= list.length) {
          finish()
          return
        }
        beginPhase(nextIndex, list)
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [status, beginPhase, finish])

  useEffect(() => {
    if (!guest || appliedQueryRef.current) return
    appliedQueryRef.current = true

    const stored = readStoredGuest()
    let nextMode: WorkoutMode = "tabata"
    let nextTitle: string | null = null
    let nextSpotify: SpotifyRef | null = null

    const hasQuery = Boolean(
      query?.mode ||
        query?.title ||
        query?.spotify ||
        query?.settings ||
        query?.autoStart !== undefined
    )

    if (hasQuery) {
      nextMode = query?.mode ?? "tabata"
      nextTitle = query?.title ?? null
      nextSpotify = query?.spotify ?? null
    } else {
      if (stored?.mode && isWorkoutMode(stored.mode)) nextMode = stored.mode
      if (stored?.title) nextTitle = stored.title
      if (stored?.spotify) {
        const parsed = parseSpotify(stored.spotify)
        if (!("error" in parsed)) nextSpotify = parsed
      }
    }

    const current = getSettingsSnapshot()
    const nextSettings: Settings = { ...current, ...query?.settings }
    if (nextMode === "emom" && query?.settings?.work === undefined) {
      nextSettings.work = nextSettings.intervalSec
    }
    if (query?.settings || (query?.mode === "emom" && query.settings?.work === undefined)) {
      saveSettings(nextSettings)
    }

    setMode(nextMode)
    setTitle(nextTitle)
    setSpotify(nextSpotify)
    writeStoredGuest({
      mode: nextMode,
      title: nextTitle,
      spotify: nextSpotify?.openUrl ?? null,
    })

    if (query?.autoStart) {
      const url = new URL(window.location.href)
      url.searchParams.delete("auto_start")
      const search = url.searchParams.toString()
      window.history.replaceState(
        {},
        "",
        `${url.pathname}${search ? `?${search}` : ""}${url.hash}`
      )
      void startWorkout(nextSettings, nextMode)
    }
  }, [guest, query, startWorkout])

  useEffect(() => {
    if (status !== "running" || !("wakeLock" in navigator)) return
    let sentinel: WakeLockSentinel | undefined
    navigator.wakeLock
      .request("screen")
      .then((lock) => {
        sentinel = lock
      })
      .catch(() => undefined)
    return () => {
      void sentinel?.release()
    }
  }, [status])

  const themeColor = phase ? PHASE_COLOR[phase.kind] : PHASE_COLOR.work
  const progress = phase ? remainingMs / (phase.duration * 1000) : 1

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col overflow-hidden bg-canvas text-ink",
        "px-5 pt-[max(2.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6"
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            status === "setup" || status === "done"
              ? "radial-gradient(ellipse at 50% 0%, var(--fill-strong), transparent 55%)"
              : `radial-gradient(ellipse at 50% 35%, ${themeColor}22, transparent 58%)`,
        }}
      />

      {guest ? (
        <Link
          href="/signup"
          className="absolute top-0 left-0 z-30 h-8 px-2.5 text-[12px] font-medium tracking-[0.08em] text-ink-muted hover:text-ink"
        >
          {PRODUCT[locale].keepTimer}
        </Link>
      ) : accountHref ? (
        <Link
          href={accountHref}
          className="absolute top-0 left-0 z-30 h-8 px-2.5 text-[12px] font-medium tracking-[0.08em] text-ink-muted hover:text-ink"
        >
          {PRODUCT[locale].account}
        </Link>
      ) : null}
      <div className="absolute top-0 right-0 z-30 flex items-center gap-2">
        <ThemeSwitcher
          labels={{
            theme: copy.theme,
            light: copy.themeLight,
            dark: copy.themeDark,
            custom: copy.themeCustom,
          }}
        />
        <LanguageSwitcher
          locale={locale}
          copy={copy}
          onChange={saveLocale}
        />
      </div>

      {status === "done" && typeof document !== "undefined"
        ? createPortal(<Confetti />, document.body)
        : null}

      {status === "setup" ? (
        <SetupView
          settings={settings}
          duration={duration}
          copy={copy}
          mode={guest ? mode : "tabata"}
          title={guest ? title : null}
          guestNote={guest ? PRODUCT[locale].tryNote : undefined}
          onChange={update}
          onStart={start}
        />
      ) : null}

      {status === "running" || status === "paused" ? (
        <ActiveView
          phase={phase}
          settings={settings}
          seconds={seconds}
          progress={progress}
          paused={status === "paused"}
          inLastFive={inLastFiveOfPhase || inLastFiveOfSession}
          sessionEnd={inLastFiveOfSession}
          copy={copy}
          title={guest ? title : null}
          mode={guest ? mode : "tabata"}
          onPause={pause}
          onResume={resume}
          onReset={reset}
          onRestartExercise={restartExercise}
        />
      ) : null}

      {status === "done" ? (
        <DoneView
          duration={duration}
          copy={copy}
          title={guest ? title : null}
          keepTimer={guest ? PRODUCT[locale].keepTimer : undefined}
          onReset={reset}
          onStart={start}
        />
      ) : null}

      {guest && spotify ? (
        <div className="relative z-10 mx-auto mt-4 w-full max-w-md">
          <SpotifyEmbed
            spotify={spotify}
            musicLabel={copy.music}
            openLabel={copy.openSpotify}
            collapsed={status === "running" || status === "paused"}
          />
        </div>
      ) : null}
    </div>
  )
}

function modeLabel(mode: WorkoutMode, copy: Messages) {
  if (mode === "emom") return copy.emom
  if (mode === "interval") return copy.intervalMode
  return "Tabata"
}

function SetupView({
  settings,
  duration,
  copy,
  mode,
  title,
  guestNote,
  onChange,
  onStart,
}: {
  settings: Settings
  duration: number
  copy: Messages
  mode: WorkoutMode
  title: string | null
  guestNote?: string
  onChange: (key: keyof Settings, value: number) => void
  onStart: () => void
}) {
  const heading = title || modeLabel(mode, copy)
  const emom = mode === "emom"
  const showEmomWork = emom && settings.work < settings.intervalSec

  return (
    <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col select-none">
      <header className="mt-4 mb-8 text-center sm:mb-10">
        <p className="text-[12px] font-medium tracking-[0.22em] text-ink-faint uppercase">
          {title ? modeLabel(mode, copy) : copy.timer}
        </p>
        <h1 className="mt-2 text-[40px] font-semibold tracking-tight">
          {heading}
        </h1>
      </header>

      <section className="overflow-hidden rounded-[22px] bg-fill">
        {emom ? (
          <>
            <StepperRow
              label={copy.interval}
              hint={copy.intervalHint}
              value={settings.intervalSec}
              suffix={SETTING_BOUNDS.intervalSec.suffix}
              min={SETTING_BOUNDS.intervalSec.min}
              max={SETTING_BOUNDS.intervalSec.max}
              decreaseLabel={`${copy.decrease} ${copy.interval.toLowerCase()}`}
              increaseLabel={`${copy.increase} ${copy.interval.toLowerCase()}`}
              onChange={(value) => onChange("intervalSec", value)}
            />
            {showEmomWork ? (
              <>
                <Divider />
                <StepperRow
                  label={copy.work}
                  hint={copy.emomHint}
                  value={settings.work}
                  suffix={SETTING_BOUNDS.work.suffix}
                  min={SETTING_BOUNDS.work.min}
                  max={settings.intervalSec}
                  decreaseLabel={`${copy.decrease} ${copy.work.toLowerCase()}`}
                  increaseLabel={`${copy.increase} ${copy.work.toLowerCase()}`}
                  onChange={(value) => onChange("work", value)}
                />
              </>
            ) : null}
            <Divider />
            <StepperRow
              label={copy.exercises}
              hint={copy.exercisesHint}
              value={settings.exercises}
              min={SETTING_BOUNDS.exercises.min}
              max={SETTING_BOUNDS.exercises.max}
              decreaseLabel={`${copy.decrease} ${copy.exercises.toLowerCase()}`}
              increaseLabel={`${copy.increase} ${copy.exercises.toLowerCase()}`}
              onChange={(value) => onChange("exercises", value)}
            />
            <Divider />
            <StepperRow
              label={copy.rounds}
              value={settings.rounds}
              min={SETTING_BOUNDS.rounds.min}
              max={SETTING_BOUNDS.rounds.max}
              decreaseLabel={`${copy.decrease} ${copy.rounds.toLowerCase()}`}
              increaseLabel={`${copy.increase} ${copy.rounds.toLowerCase()}`}
              onChange={(value) => onChange("rounds", value)}
            />
          </>
        ) : (
          <>
            <StepperRow
              label={copy.work}
              hint={copy.workHint}
              value={settings.work}
              suffix={SETTING_BOUNDS.work.suffix}
              min={SETTING_BOUNDS.work.min}
              max={SETTING_BOUNDS.work.max}
              decreaseLabel={`${copy.decrease} ${copy.work.toLowerCase()}`}
              increaseLabel={`${copy.increase} ${copy.work.toLowerCase()}`}
              onChange={(value) => onChange("work", value)}
            />
            <Divider />
            <StepperRow
              label={copy.rest}
              hint={copy.restHint}
              value={settings.rest}
              suffix={SETTING_BOUNDS.rest.suffix}
              min={SETTING_BOUNDS.rest.min}
              max={SETTING_BOUNDS.rest.max}
              decreaseLabel={`${copy.decrease} ${copy.rest.toLowerCase()}`}
              increaseLabel={`${copy.increase} ${copy.rest.toLowerCase()}`}
              onChange={(value) => onChange("rest", value)}
            />
            <Divider />
            <StepperRow
              label={copy.exercises}
              hint={copy.exercisesHint}
              value={settings.exercises}
              min={SETTING_BOUNDS.exercises.min}
              max={SETTING_BOUNDS.exercises.max}
              decreaseLabel={`${copy.decrease} ${copy.exercises.toLowerCase()}`}
              increaseLabel={`${copy.increase} ${copy.exercises.toLowerCase()}`}
              onChange={(value) => onChange("exercises", value)}
            />
            <Divider />
            <StepperRow
              label={copy.rounds}
              value={settings.rounds}
              min={SETTING_BOUNDS.rounds.min}
              max={SETTING_BOUNDS.rounds.max}
              decreaseLabel={`${copy.decrease} ${copy.rounds.toLowerCase()}`}
              increaseLabel={`${copy.increase} ${copy.rounds.toLowerCase()}`}
              onChange={(value) => onChange("rounds", value)}
            />
            <Divider />
            <StepperRow
              label={copy.roundRest}
              hint={settings.rounds === 1 ? copy.roundRestHint : undefined}
              value={settings.roundRest}
              suffix={SETTING_BOUNDS.roundRest.suffix}
              min={SETTING_BOUNDS.roundRest.min}
              max={SETTING_BOUNDS.roundRest.max}
              decreaseLabel={`${copy.decrease} ${copy.roundRest.toLowerCase()}`}
              increaseLabel={`${copy.increase} ${copy.roundRest.toLowerCase()}`}
              onChange={(value) => onChange("roundRest", value)}
            />
          </>
        )}
      </section>

      <p
        aria-live="polite"
        className="mt-5 text-center text-[15px] text-ink-muted tabular-nums"
      >
        {formatClock(duration)} {copy.total}
      </p>

      <div className="mt-auto flex flex-col items-center pt-8">
        <Button
          type="button"
          onClick={onStart}
          className="h-14 w-full max-w-[220px] rounded-full bg-cta text-[17px] font-medium text-cta-fg hover:opacity-90"
        >
          {copy.start}
        </Button>
        {guestNote ? (
          <p className="mt-3 text-center text-[13px] text-ink-faint">
            {guestNote}
          </p>
        ) : null}
      </div>
    </main>
  )
}

function ActiveView({
  phase,
  settings,
  seconds,
  progress,
  paused,
  inLastFive,
  sessionEnd,
  copy,
  title,
  mode,
  onPause,
  onResume,
  onReset,
  onRestartExercise,
}: {
  phase?: Phase
  settings: Settings
  seconds: number
  progress: number
  paused: boolean
  inLastFive: boolean
  sessionEnd: boolean
  copy: Messages
  title: string | null
  mode: WorkoutMode
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onRestartExercise: () => void
}) {
  if (!phase) return null
  const color = paused ? "color-mix(in srgb, var(--ink) 28%, transparent)" : PHASE_COLOR[phase.kind]
  const label =
    paused
      ? copy.pause
      : phase.kind === "work"
        ? mode === "emom" && phase.duration === settings.intervalSec
          ? copy.emom
          : copy.work
        : phase.kind === "rest"
          ? copy.rest
          : copy.roundPause

  return (
    <main className="relative mx-auto grid min-h-0 w-full max-w-3xl flex-1 grid-rows-[auto_minmax(0,1fr)_auto] select-none">
      <div className="flex flex-col items-center gap-3 pt-1 sm:pt-2">
      {title ? (
        <p className="text-center text-[13px] font-medium tracking-[0.08em] text-ink-muted">
          {title}
        </p>
      ) : null}
      <div className="flex items-center justify-center gap-8 sm:gap-12">
        <CountRing
          current={phase.round}
          total={settings.rounds}
          label={copy.round}
          color={paused ? "color-mix(in srgb, var(--ink) 35%, transparent)" : PHASE_COLOR.roundRest}
        />
        <CountRing
          current={phase.exercise}
          total={settings.exercises}
          label={copy.exercise}
          color={paused ? "color-mix(in srgb, var(--ink) 35%, transparent)" : PHASE_COLOR.work}
        />
      </div>
      </div>

      <div className="flex h-full min-h-0 w-full items-center justify-center [container-type:size]">
        <TimerRing
          progress={progress}
          color={color}
          className="size-[min(100cqw,100cqh,36rem)]"
        >
          <p
            className="text-[13px] font-medium tracking-[0.22em] uppercase sm:text-[14px]"
            style={{ color: paused ? "color-mix(in srgb, var(--ink) 45%, transparent)" : PHASE_COLOR[phase.kind] }}
          >
            {label}
          </p>
          <p
            key={`${phase.kind}-${seconds}`}
            aria-live="polite"
            className={cn(
              "mt-1 font-light tracking-[-0.06em] text-ink tabular-nums",
              "text-[clamp(2.75rem,32cqw,7.5rem)] leading-none",
              inLastFive && !paused && "animate-[second-pulse_0.55s_ease-out]",
              sessionEnd && !paused && "text-[#ffd60a]"
            )}
          >
            {seconds}
          </p>
        </TimerRing>
      </div>

      <div className="flex w-full flex-col items-center gap-3 pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={onRestartExercise}
          className="h-10 rounded-full px-4 text-[14px] text-ink-muted hover:bg-fill hover:text-ink"
        >
          <RotateCcw className="size-3.5" />
          {copy.restartExercise}
        </Button>
        <div className="flex w-full items-center justify-center gap-3 sm:gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            className="h-14 rounded-full bg-fill px-6 text-[16px] text-ink hover:bg-fill-strong"
          >
            {copy.end}
          </Button>
          <Button
            type="button"
            onClick={paused ? onResume : onPause}
            className="h-14 min-w-32 rounded-full bg-cta px-7 text-[16px] font-medium text-cta-fg hover:opacity-90 sm:min-w-36"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            {paused ? copy.resume : copy.pause}
          </Button>
        </div>
      </div>
    </main>
  )
}

function DoneView({
  duration,
  copy,
  title,
  keepTimer,
  onReset,
  onStart,
}: {
  duration: number
  copy: Messages
  title: string | null
  keepTimer?: string
  onReset: () => void
  onStart: () => void
}) {
  return (
    <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center select-none">
      <p className="text-[12px] font-medium tracking-[0.22em] text-ink-faint uppercase">
        {title || copy.done}
      </p>
      <h1 className="mt-3 text-[40px] font-semibold tracking-tight">
        {copy.niceWork}
      </h1>
      <p className="mt-3 text-[18px] text-ink-muted tabular-nums">
        {formatClock(duration)}
      </p>
      <div className="mt-12 flex w-full flex-col items-center gap-3">
        <Button
          type="button"
          onClick={onStart}
          className="h-14 w-full max-w-[220px] rounded-full bg-cta text-[17px] font-medium text-cta-fg hover:opacity-90"
        >
          {copy.again}
        </Button>
        {keepTimer ? (
          <Link
            href="/signup"
            className="inline-flex h-12 w-full max-w-[220px] items-center justify-center text-[15px] text-ink-muted hover:text-ink"
          >
            {keepTimer}
          </Link>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="h-11 text-[15px] text-ink-muted hover:bg-transparent hover:text-ink"
        >
          <RotateCcw className="size-3.5" />
          {copy.settings}
        </Button>
      </div>
    </main>
  )
}

function Divider() {
  return <div className="ml-5 h-px bg-fill-strong" />
}
