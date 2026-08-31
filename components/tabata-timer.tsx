"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { Pause, Play, RotateCcw } from "lucide-react"

import { StepperRow } from "@/components/stepper-row"
import { TimerRing } from "@/components/timer-ring"
import { Button } from "@/components/ui/button"
import { tabataAudio } from "@/lib/audio"
import { cn } from "@/lib/utils"
import {
  SETTING_BOUNDS,
  buildPhases,
  clampSetting,
  displaySeconds,
  formatClock,
  getServerSettingsSnapshot,
  getSettingsSnapshot,
  remainingAfterIndex,
  saveSettings,
  subscribeSettings,
  totalSeconds,
  type Phase,
  type Settings,
} from "@/lib/workout"

type Status = "setup" | "running" | "paused" | "done"

const PHASE_COPY = {
  work: { label: "Arbeid", color: "#ff9f0a" },
  rest: { label: "Hvile", color: "#30d158" },
  roundRest: { label: "Rundepause", color: "#64d2ff" },
} as const

export function TabataTimer() {
  const settings = useSyncExternalStore(
    subscribeSettings,
    getSettingsSnapshot,
    getServerSettingsSnapshot
  )
  const [status, setStatus] = useState<Status>("setup")
  const [phases, setPhases] = useState<Phase[]>([])
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [remainingMs, setRemainingMs] = useState(0)

  const phaseIndexRef = useRef(0)
  const phaseEndRef = useRef(0)
  const lastBeepRef = useRef<number | null>(null)
  const phasesRef = useRef<Phase[]>([])
  const runningRef = useRef(false)

  useEffect(() => {
    phasesRef.current = phases
  }, [phases])

  const duration = useMemo(() => totalSeconds(settings), [settings])
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

  const start = useCallback(async () => {
    await tabataAudio.unlock()
    const list = buildPhases(settings)
    if (list.length === 0) return
    setPhases(list)
    phasesRef.current = list
    runningRef.current = true
    setStatus("running")
    beginPhase(0, list)
  }, [beginPhase, settings])

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

  const theme = phase ? PHASE_COPY[phase.kind] : PHASE_COPY.work
  const progress = phase ? remainingMs / (phase.duration * 1000) : 1

  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col overflow-hidden bg-black text-white select-none",
        "px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            status === "setup" || status === "done"
              ? "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06), transparent 55%)"
              : `radial-gradient(ellipse at 50% 35%, ${theme.color}22, transparent 58%)`,
        }}
      />

      {status === "setup" ? (
        <SetupView
          settings={settings}
          duration={duration}
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
          onPause={pause}
          onResume={resume}
          onReset={reset}
        />
      ) : null}

      {status === "done" ? (
        <DoneView duration={duration} onReset={reset} onStart={start} />
      ) : null}
    </div>
  )
}

function SetupView({
  settings,
  duration,
  onChange,
  onStart,
}: {
  settings: Settings
  duration: number
  onChange: (key: keyof Settings, value: number) => void
  onStart: () => void
}) {
  return (
    <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="mb-10 text-center">
        <p className="text-[12px] font-medium tracking-[0.22em] text-white/35 uppercase">
          Timer
        </p>
        <h1 className="mt-2 text-[40px] font-semibold tracking-tight">Tabata</h1>
      </header>

      <section className="overflow-hidden rounded-[22px] bg-white/6">
        <StepperRow
          label="Arbeid"
          hint="Aktive sekunder"
          value={settings.work}
          suffix={SETTING_BOUNDS.work.suffix}
          min={SETTING_BOUNDS.work.min}
          max={SETTING_BOUNDS.work.max}
          onChange={(value) => onChange("work", value)}
        />
        <Divider />
        <StepperRow
          label="Hvile"
          hint="Mellom øvelser"
          value={settings.rest}
          suffix={SETTING_BOUNDS.rest.suffix}
          min={SETTING_BOUNDS.rest.min}
          max={SETTING_BOUNDS.rest.max}
          onChange={(value) => onChange("rest", value)}
        />
        <Divider />
        <StepperRow
          label="Øvelser"
          hint="Per runde"
          value={settings.exercises}
          min={SETTING_BOUNDS.exercises.min}
          max={SETTING_BOUNDS.exercises.max}
          onChange={(value) => onChange("exercises", value)}
        />
        <Divider />
        <StepperRow
          label="Runder"
          value={settings.rounds}
          min={SETTING_BOUNDS.rounds.min}
          max={SETTING_BOUNDS.rounds.max}
          onChange={(value) => onChange("rounds", value)}
        />
        <Divider />
        <StepperRow
          label="Mellom runder"
          hint={settings.rounds === 1 ? "Brukes ved flere runder" : undefined}
          value={settings.roundRest}
          suffix={SETTING_BOUNDS.roundRest.suffix}
          min={SETTING_BOUNDS.roundRest.min}
          max={SETTING_BOUNDS.roundRest.max}
          onChange={(value) => onChange("roundRest", value)}
        />
      </section>

      <p className="mt-5 text-center text-[15px] text-white/40 tabular-nums">
        {formatClock(duration)} totalt
      </p>

      <div className="mt-auto flex justify-center pt-10">
        <Button
          type="button"
          onClick={onStart}
          className="h-14 w-full max-w-[220px] rounded-full bg-white text-[17px] font-medium text-black hover:bg-white/90"
        >
          Start
        </Button>
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
  onPause,
  onResume,
  onReset,
}: {
  phase?: Phase
  settings: Settings
  seconds: number
  progress: number
  paused: boolean
  inLastFive: boolean
  sessionEnd: boolean
  onPause: () => void
  onResume: () => void
  onReset: () => void
}) {
  if (!phase) return null
  const theme = PHASE_COPY[phase.kind]
  const showExercises = settings.exercises > 1
  const showRounds = settings.rounds > 1

  return (
    <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center">
      <p className="text-[13px] font-medium tracking-[0.18em] text-white/40 uppercase">
        {showRounds ? `Runde ${phase.round} / ${settings.rounds}` : "Tabata"}
        {showExercises ? `  ·  Øvelse ${phase.exercise} / ${settings.exercises}` : ""}
      </p>

      <TimerRing
        progress={progress}
        color={paused ? "rgba(255,255,255,0.28)" : theme.color}
        className="mt-8"
      >
        <p
          className="text-[13px] font-medium tracking-[0.22em] uppercase"
          style={{ color: paused ? "rgba(255,255,255,0.45)" : theme.color }}
        >
          {paused ? "Pause" : theme.label}
        </p>
        <p
          key={`${phase.kind}-${seconds}`}
          aria-live="polite"
          className={cn(
            "mt-1 font-light tracking-[-0.06em] text-white tabular-nums",
            "text-[92px] leading-none sm:text-[108px]",
            inLastFive && !paused && "animate-[second-pulse_0.55s_ease-out]",
            sessionEnd && !paused && "text-[#ffd60a]"
          )}
        >
          {seconds}
        </p>
      </TimerRing>

      <div className="mt-auto flex w-full items-center justify-center gap-4 pt-8">
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="h-14 rounded-full bg-white/8 px-6 text-[16px] text-white hover:bg-white/14"
        >
          Avslutt
        </Button>
        <Button
          type="button"
          onClick={paused ? onResume : onPause}
          className="h-14 min-w-36 rounded-full bg-white px-7 text-[16px] font-medium text-black hover:bg-white/90"
        >
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          {paused ? "Fortsett" : "Pause"}
        </Button>
      </div>
    </main>
  )
}

function DoneView({
  duration,
  onReset,
  onStart,
}: {
  duration: number
  onReset: () => void
  onStart: () => void
}) {
  return (
    <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
      <p className="text-[12px] font-medium tracking-[0.22em] text-white/35 uppercase">
        Ferdig
      </p>
      <h1 className="mt-3 text-[40px] font-semibold tracking-tight">Bra jobba</h1>
      <p className="mt-3 text-[18px] text-white/45 tabular-nums">
        {formatClock(duration)}
      </p>
      <div className="mt-12 flex w-full flex-col items-center gap-3">
        <Button
          type="button"
          onClick={onStart}
          className="h-14 w-full max-w-[220px] rounded-full bg-white text-[17px] font-medium text-black hover:bg-white/90"
        >
          Igjen
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="h-11 text-[15px] text-white/50 hover:bg-transparent hover:text-white"
        >
          <RotateCcw className="size-3.5" />
          Innstillinger
        </Button>
      </div>
    </main>
  )
}

function Divider() {
  return <div className="ml-5 h-px bg-white/8" />
}
