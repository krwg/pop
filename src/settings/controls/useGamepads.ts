import { useEffect, useState } from 'react'

export type DetectedGamepad = {
  index: number
  id: string
  mapping: string
  buttons: number
  axes: number
  connected: boolean
}

function readGamepads(): DetectedGamepad[] {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return []
  const pads = navigator.getGamepads()
  const list: DetectedGamepad[] = []

  for (const pad of pads) {
    if (!pad) continue
    list.push({
      index: pad.index,
      id: pad.id,
      mapping: pad.mapping || 'unknown',
      buttons: pad.buttons.length,
      axes: pad.axes.length,
      connected: pad.connected,
    })
  }

  return list
}

export function useGamepads(pollMs = 400) {
  const [gamepads, setGamepads] = useState<DetectedGamepad[]>(() => readGamepads())

  useEffect(() => {
    const sync = () => setGamepads(readGamepads())
    sync()

    window.addEventListener('gamepadconnected', sync)
    window.addEventListener('gamepaddisconnected', sync)
    const timer = window.setInterval(sync, pollMs)

    return () => {
      window.removeEventListener('gamepadconnected', sync)
      window.removeEventListener('gamepaddisconnected', sync)
      window.clearInterval(timer)
    }
  }, [pollMs])

  return gamepads
}

export function listenNextGamepadButton(
  onButton: (buttonIndex: number) => void,
  timeoutMs = 8000,
): () => void {
  let active = true
  const started = performance.now()
  const baseline = new Map<string, boolean[]>()

  const captureBaseline = () => {
    const pads = navigator.getGamepads()
    for (const pad of pads) {
      if (!pad) continue
      baseline.set(
        String(pad.index),
        pad.buttons.map((button) => button.pressed),
      )
    }
  }

  captureBaseline()

  const frame = () => {
    if (!active) return
    if (performance.now() - started > timeoutMs) {
      active = false
      return
    }

    const pads = navigator.getGamepads()
    for (const pad of pads) {
      if (!pad) continue
      const prev = baseline.get(String(pad.index)) ?? []
      for (let i = 0; i < pad.buttons.length; i += 1) {
        const pressed = pad.buttons[i]?.pressed ?? false
        const wasPressed = prev[i] ?? false
        if (pressed && !wasPressed) {
          active = false
          onButton(i)
          return
        }
      }
      baseline.set(
        String(pad.index),
        pad.buttons.map((button) => button.pressed),
      )
    }

    requestAnimationFrame(frame)
  }

  const raf = requestAnimationFrame(frame)
  return () => {
    active = false
    cancelAnimationFrame(raf)
  }
}
