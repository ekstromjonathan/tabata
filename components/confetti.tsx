"use client"

import { useEffect, useRef } from "react"

type Piece = {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  vr: number
  hue: number
  sat: number
  light: number
  shape: "rect" | "ribbon" | "circle"
  gravity: number
  drag: number
}

function spawnBurst(
  pieces: Piece[],
  originX: number,
  originY: number,
  count: number,
  direction: "up" | "left" | "right" | "fountain"
) {
  for (let i = 0; i < count; i++) {
    const hue = Math.random() * 360
    const speed =
      direction === "fountain" ? 7 + Math.random() * 11 : 10 + Math.random() * 16
    let angle: number
    if (direction === "left") angle = Math.PI + (Math.random() - 0.5) * 1.1
    else if (direction === "right") angle = (Math.random() - 0.5) * 1.1
    else if (direction === "up") angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4
    else angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9

    const roll = Math.random()
    pieces.push({
      x: originX + (Math.random() - 0.5) * 24,
      y: originY + (Math.random() - 0.5) * 16,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 5 + Math.random() * 9,
      h: 8 + Math.random() * 14,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.45,
      hue,
      sat: 72 + Math.random() * 28,
      light: 52 + Math.random() * 22,
      shape: roll > 0.72 ? "circle" : roll > 0.4 ? "ribbon" : "rect",
      gravity: 0.14 + Math.random() * 0.08,
      drag: 0.985 + Math.random() * 0.01,
    })
  }
}

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const surface = canvas
    const brush = ctx

    const pieces: Piece[] = []
    let frame = 0
    let running = true

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      surface.width = window.innerWidth * dpr
      surface.height = window.innerHeight * dpr
      surface.style.width = `${window.innerWidth}px`
      surface.style.height = `${window.innerHeight}px`
      brush.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function fire() {
      const w = window.innerWidth
      const h = window.innerHeight
      spawnBurst(pieces, w * 0.5, h * 0.18, 90, "fountain")
      spawnBurst(pieces, 0, h * 0.42, 80, "right")
      spawnBurst(pieces, w, h * 0.42, 80, "left")
      spawnBurst(pieces, w * 0.22, h * 0.12, 50, "up")
      spawnBurst(pieces, w * 0.78, h * 0.12, 50, "up")
    }

    resize()
    fire()
    const wave2 = window.setTimeout(() => {
      spawnBurst(pieces, window.innerWidth * 0.5, window.innerHeight * 0.2, 70, "fountain")
      spawnBurst(pieces, 0, window.innerHeight * 0.55, 55, "right")
      spawnBurst(pieces, window.innerWidth, window.innerHeight * 0.55, 55, "left")
    }, 280)
    const wave3 = window.setTimeout(() => {
      spawnBurst(pieces, window.innerWidth * 0.5, window.innerHeight * 0.14, 60, "up")
    }, 700)

    function tick() {
      if (!running) return
      brush.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (const piece of pieces) {
        piece.vx *= piece.drag
        piece.vy = piece.vy * piece.drag + piece.gravity
        piece.x += piece.vx
        piece.y += piece.vy
        piece.rot += piece.vr
        brush.save()
        brush.translate(piece.x, piece.y)
        brush.rotate(piece.rot)
        brush.fillStyle = `hsl(${piece.hue} ${piece.sat}% ${piece.light}%)`
        if (piece.shape === "circle") {
          brush.beginPath()
          brush.arc(0, 0, piece.w * 0.45, 0, Math.PI * 2)
          brush.fill()
        } else if (piece.shape === "ribbon") {
          brush.fillRect(-piece.w * 0.2, -piece.h * 0.5, piece.w * 0.4, piece.h)
        } else {
          brush.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h)
        }
        brush.restore()
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    window.addEventListener("resize", resize)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.clearTimeout(wave2)
      window.clearTimeout(wave3)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
    />
  )
}
