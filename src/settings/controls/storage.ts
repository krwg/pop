import {
  CONTROL_ACTIONS,
  DEFAULT_CONTROLS,
  DEFAULT_KEYBOARD,
  type ControlAction,
  type ControlsConfig,
  type KeyboardBinding,
} from './types'

const STORAGE_KEY = 'pop:controls-v2'

function isGamepadBinding(value: unknown): boolean {
  if (value == null || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    candidate.kind === 'gamepadButton' &&
    typeof candidate.button === 'number' &&
    Number.isInteger(candidate.button) &&
    candidate.button >= 0
  )
}

function isKeyBinding(value: unknown): value is KeyboardBinding {
  if (value == null || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return candidate.kind === 'key' && typeof candidate.code === 'string'
}

export function loadControlsConfig(): ControlsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('pop:controls-v1')
    if (!raw) return structuredClone(DEFAULT_CONTROLS)
    const parsed = JSON.parse(raw) as Partial<ControlsConfig> & {
      bindings?: Record<string, unknown>
      keyboard?: Record<string, unknown>
    }

    const bindings = { ...DEFAULT_CONTROLS.bindings }
    if (parsed.bindings) {
      for (const action of CONTROL_ACTIONS) {
        const next = parsed.bindings[action]
        if (isGamepadBinding(next)) {
          bindings[action] = next as ControlsConfig['bindings'][ControlAction]
        }
      }
    }

    const keyboard = { ...DEFAULT_KEYBOARD }
    if (parsed.keyboard) {
      for (const action of CONTROL_ACTIONS) {
        const next = parsed.keyboard[action]
        if (isKeyBinding(next)) keyboard[action] = next
      }
    }

    return { version: 2, bindings, keyboard }
  } catch {
    return structuredClone(DEFAULT_CONTROLS)
  }
}

export function saveControlsConfig(config: ControlsConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...config, version: 2 }))
}
