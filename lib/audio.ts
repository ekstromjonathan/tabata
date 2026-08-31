type Tone = {
  frequency: number
  duration?: number
  volume?: number
  delay?: number
  attack?: number
  type?: OscillatorType
}

export class TabataAudio {
  private ctx: AudioContext | null = null

  async unlock() {
    const Ctx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctx) return
    if (!this.ctx) this.ctx = new Ctx()
    if (this.ctx.state === "suspended") {
      await this.ctx.resume()
    }
  }

  work() {
    this.tone({ frequency: 523.25, duration: 0.16, volume: 0.1 })
    this.tone({ frequency: 659.25, duration: 0.28, volume: 0.08, delay: 0.1 })
    this.buzz(12)
  }

  rest() {
    this.tone({ frequency: 392, duration: 0.32, volume: 0.09 })
    this.tone({ frequency: 493.88, duration: 0.36, volume: 0.06, delay: 0.07 })
    this.buzz(10)
  }

  roundRest() {
    this.tone({ frequency: 329.63, duration: 0.4, volume: 0.08 })
    this.tone({ frequency: 440, duration: 0.4, volume: 0.05, delay: 0.12 })
    this.buzz(8)
  }

  countdown(secondsLeft: number, sessionEnd: boolean) {
    const base = sessionEnd ? 784 : 659.25
    const frequency = base + (5 - secondsLeft) * 36
    const last = secondsLeft === 1
    this.tone({
      frequency,
      duration: last ? 0.38 : 0.11,
      volume: sessionEnd ? 0.13 : 0.09,
    })
    if (sessionEnd) {
      this.tone({
        frequency: frequency * 1.5,
        duration: last ? 0.32 : 0.09,
        volume: 0.04,
        delay: 0.02,
      })
    }
    this.buzz(last ? 24 : 8)
  }

  complete() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((frequency, index) => {
      this.tone({
        frequency,
        duration: 0.55,
        volume: 0.07,
        delay: index * 0.13,
      })
    })
    this.buzz([18, 40, 18, 40, 36])
  }

  private tone({
    frequency,
    duration = 0.2,
    volume = 0.1,
    delay = 0,
    attack = 0.012,
    type = "sine",
  }: Tone) {
    const ctx = this.ctx
    if (!ctx) return

    const start = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = type
    osc.frequency.setValueAtTime(frequency, start)

    filter.type = "lowpass"
    filter.frequency.setValueAtTime(Math.min(2400, frequency * 3.2), start)
    filter.Q.value = 0.55

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(start)
    osc.stop(start + duration + 0.04)
  }

  private buzz(pattern: number | number[]) {
    if (typeof navigator === "undefined" || !navigator.vibrate) return
    navigator.vibrate(pattern)
  }
}

export const tabataAudio = new TabataAudio()
