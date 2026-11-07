import { useEffect, useState } from 'react'
import type { DetectedGamepad } from './useGamepads'

export type LivePadState = {
  index: number
  pressed: Record<number, number>
  axes: number[]
}

const livePads = new Map<number, Gamepad>()

export function getLiveGamepad(index: number): Gamepad | null {
  const fresh = navigator.getGamepads()[index]
  if (fresh) {
    livePads.set(index, fresh)
    return fresh
  }
  return livePads.get(index) ?? null
}

export function useGamepadInput(activePad: DetectedGamepad | null) {
  const [live, setLive] = useState<LivePadState | null>(null)

  useEffect(() => {
    if (!activePad) {
      setLive(null)
      return
    }

    let raf = 0
    const tick = () => {
      const pads = navigator.getGamepads()
      for (const pad of pads) {
        if (pad) livePads.set(pad.index, pad)
      }
      const pad = pads[activePad.index] ?? livePads.get(activePad.index)
      if (!pad) {
        setLive(null)
      } else {
        const pressed: Record<number, number> = {}
        pad.buttons.forEach((button, index) => {
          const value = button.value || (button.pressed ? 1 : 0)
          if (value > 0.08) pressed[index] = value
        })
        setLive({
          index: pad.index,
          pressed,
          axes: Array.from(pad.axes),
        })
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [activePad])

  return live
}

type HapticActuator = {
  playEffect?: (
    type: string,
    params: Record<string, number>,
  ) => Promise<unknown> | unknown
  reset?: () => Promise<unknown> | unknown
  pulse?: (value: number, duration: number) => Promise<unknown> | unknown
}

function actuatorsOf(pad: Gamepad): HapticActuator[] {
  const ext = pad as Gamepad & {
    vibrationActuator?: HapticActuator | null
    hapticActuators?: Array<HapticActuator | null> | null
  }
  const out: HapticActuator[] = []
  if (ext.vibrationActuator) out.push(ext.vibrationActuator)
  if (ext.hapticActuators) {
    for (const item of ext.hapticActuators) {
      if (item) out.push(item)
    }
  }
  return out
}

function asPromise(value: unknown): Promise<unknown> {
  if (value != null && typeof (value as Promise<unknown>).then === 'function') {
    return value as Promise<unknown>
  }
  return Promise.resolve(value)
}

function fireActuator(actuator: HapticActuator): boolean {
  const play = actuator.playEffect?.bind(actuator)
  if (play) {
    const attempts: Array<{ type: string; params: Record<string, number> }> = [
      {
        type: 'dual-rumble',
        params: {
          startDelay: 0,
          duration: 420,
          weakMagnitude: 0.28,
          strongMagnitude: 0.22,
        },
      },
      {
        type: 'dual-rumble',
        params: {
          duration: 420,
          weakMagnitude: 0.28,
          strongMagnitude: 0.22,
        },
      },
      {
        type: 'vibration',
        params: {
          duration: 420,
          weakMagnitude: 0.3,
          strongMagnitude: 0.2,
        },
      },
    ]

    for (const attempt of attempts) {
      try {
        // Must stay synchronous inside the user-gesture turn.
        const result = play(attempt.type, attempt.params)
        void asPromise(result).catch(() => undefined)
        return true
      } catch {
        // try next payload
      }
    }
  }

  const pulse = actuator.pulse?.bind(actuator)
  if (pulse) {
    try {
      const result = pulse(0.28, 420)
      void asPromise(result).catch(() => undefined)
      return true
    } catch {
      return false
    }
  }

  return false
}

/** True when the live pad exposes any haptic actuator API. */
export function padHasHapticActuator(padIndex: number): boolean {
  const pads = navigator.getGamepads()
  const pad = pads[padIndex]
  if (!pad) return false
  return actuatorsOf(pad).length > 0
}

export type VibrateProbe = {
  ok: boolean
  reason?: 'no-pad' | 'no-actuator' | 'play-failed'
  hasActuator: boolean
}

/**
 * Keep this fully sync after getGamepads() so Chrome does not drop
 * transient user activation before playEffect runs.
 */
export function testGamepadVibration(padIndex: number): VibrateProbe {
  const pads = navigator.getGamepads()
  for (const pad of pads) {
    if (pad) livePads.set(pad.index, pad)
  }

  const candidates: Gamepad[] = []
  const primary = pads[padIndex] ?? livePads.get(padIndex)
  if (primary) candidates.push(primary)
  for (const pad of pads) {
    if (pad && pad.index !== padIndex) candidates.push(pad)
  }

  if (candidates.length === 0) {
    return { ok: false, reason: 'no-pad', hasActuator: false }
  }

  let sawActuator = false
  for (const pad of candidates) {
    const actuators = actuatorsOf(pad)
    if (actuators.length > 0) sawActuator = true
    for (const actuator of actuators) {
      if (fireActuator(actuator)) {
        return { ok: true, hasActuator: true }
      }
    }
  }

  return {
    ok: false,
    reason: sawActuator ? 'play-failed' : 'no-actuator',
    hasActuator: sawActuator,
  }
}
