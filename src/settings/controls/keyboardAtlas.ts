import type { ControlAction } from './types'

export type KeySpot = {
  id: string
  /** KeyboardEvent.code */
  code: string
  action?: ControlAction
  label: string
  left: number
  top: number
  width: number
  height: number
}

/**
 * Approximate TKL layout hotspots over keyboard/base.png (1280×720).
 * Tuned for the Warm Ember generated keyboard art.
 */
export const KEYBOARD_SPOTS: readonly KeySpot[] = [
  // WASD cluster
  { id: 'KeyW', code: 'KeyW', action: 'moveUp', label: 'W', left: 22.2, top: 38.5, width: 3.6, height: 6.2 },
  { id: 'KeyA', code: 'KeyA', action: 'moveLeft', label: 'A', left: 18.4, top: 46.5, width: 3.6, height: 6.2 },
  { id: 'KeyS', code: 'KeyS', action: 'moveDown', label: 'S', left: 22.2, top: 46.5, width: 3.6, height: 6.2 },
  { id: 'KeyD', code: 'KeyD', action: 'moveRight', label: 'D', left: 26.0, top: 46.5, width: 3.6, height: 6.2 },

  // Arrows
  { id: 'ArrowUp', code: 'ArrowUp', action: 'moveUp', label: '↑', left: 78.8, top: 54.5, width: 3.5, height: 5.8 },
  { id: 'ArrowLeft', code: 'ArrowLeft', action: 'moveLeft', label: '←', left: 75.0, top: 62.0, width: 3.5, height: 5.8 },
  { id: 'ArrowDown', code: 'ArrowDown', action: 'moveDown', label: '↓', left: 78.8, top: 62.0, width: 3.5, height: 5.8 },
  { id: 'ArrowRight', code: 'ArrowRight', action: 'moveRight', label: '→', left: 82.6, top: 62.0, width: 3.5, height: 5.8 },

  // Actions
  { id: 'Enter', code: 'Enter', action: 'confirm', label: 'Enter', left: 70.5, top: 38.5, width: 7.2, height: 6.2 },
  { id: 'Escape', code: 'Escape', action: 'cancel', label: 'Esc', left: 8.2, top: 22.5, width: 3.8, height: 5.5 },
  { id: 'Space', code: 'Space', action: 'confirm', label: 'Space', left: 30.0, top: 62.0, width: 22.0, height: 6.0 },
  { id: 'KeyE', code: 'KeyE', action: 'actionPrimary', label: 'E', left: 26.0, top: 38.5, width: 3.6, height: 6.2 },
  { id: 'KeyQ', code: 'KeyQ', action: 'actionSecondary', label: 'Q', left: 18.4, top: 38.5, width: 3.6, height: 6.2 },
  { id: 'Tab', code: 'Tab', action: 'menu', label: 'Tab', left: 8.2, top: 38.5, width: 5.5, height: 6.2 },

  // Extra visible keys for live feedback (no default action)
  { id: 'KeyR', code: 'KeyR', label: 'R', left: 29.8, top: 38.5, width: 3.6, height: 6.2 },
  { id: 'KeyF', code: 'KeyF', label: 'F', left: 29.8, top: 46.5, width: 3.6, height: 6.2 },
  { id: 'ShiftLeft', code: 'ShiftLeft', label: 'Shift', left: 8.2, top: 54.5, width: 8.5, height: 6.0 },
  { id: 'ControlLeft', code: 'ControlLeft', label: 'Ctrl', left: 8.2, top: 62.0, width: 4.5, height: 6.0 },
  { id: 'AltLeft', code: 'AltLeft', label: 'Alt', left: 18.5, top: 62.0, width: 4.5, height: 6.0 },
  { id: 'Backspace', code: 'Backspace', label: 'Bksp', left: 70.5, top: 30.5, width: 7.2, height: 5.8 },
]
