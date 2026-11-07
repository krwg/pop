export type ControlAction =
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'confirm'
  | 'cancel'
  | 'menu'
  | 'actionPrimary'
  | 'actionSecondary'

export type GamepadButtonBinding = {
  kind: 'gamepadButton'
  /** W3C standard gamepad button index */
  button: number
}

export type KeyboardBinding = {
  kind: 'key'
  /** KeyboardEvent.code */
  code: string
}

export type ControlBinding = GamepadButtonBinding

export type ControlsConfig = {
  version: 2
  bindings: Record<ControlAction, ControlBinding>
  keyboard: Record<ControlAction, KeyboardBinding>
}

export const CONTROL_ACTIONS: readonly ControlAction[] = [
  'moveUp',
  'moveDown',
  'moveLeft',
  'moveRight',
  'confirm',
  'cancel',
  'menu',
  'actionPrimary',
  'actionSecondary',
] as const

export const DEFAULT_KEYBOARD: Record<ControlAction, KeyboardBinding> = {
  moveUp: { kind: 'key', code: 'KeyW' },
  moveDown: { kind: 'key', code: 'KeyS' },
  moveLeft: { kind: 'key', code: 'KeyA' },
  moveRight: { kind: 'key', code: 'KeyD' },
  confirm: { kind: 'key', code: 'Enter' },
  cancel: { kind: 'key', code: 'Escape' },
  menu: { kind: 'key', code: 'Tab' },
  actionPrimary: { kind: 'key', code: 'KeyE' },
  actionSecondary: { kind: 'key', code: 'KeyQ' },
}

/** Defaults follow the W3C "standard" gamepad mapping. */
export const DEFAULT_CONTROLS: ControlsConfig = {
  version: 2,
  bindings: {
    moveUp: { kind: 'gamepadButton', button: 12 },
    moveDown: { kind: 'gamepadButton', button: 13 },
    moveLeft: { kind: 'gamepadButton', button: 14 },
    moveRight: { kind: 'gamepadButton', button: 15 },
    confirm: { kind: 'gamepadButton', button: 0 },
    cancel: { kind: 'gamepadButton', button: 1 },
    menu: { kind: 'gamepadButton', button: 9 },
    actionPrimary: { kind: 'gamepadButton', button: 2 },
    actionSecondary: { kind: 'gamepadButton', button: 3 },
  },
  keyboard: { ...DEFAULT_KEYBOARD },
}

export const STANDARD_BUTTON_LABELS: Record<number, string> = {
  0: 'A / Cross',
  1: 'B / Circle',
  2: 'X / Square',
  3: 'Y / Triangle',
  4: 'LB / L1',
  5: 'RB / R1',
  6: 'LT / L2',
  7: 'RT / R2',
  8: 'Select / Share',
  9: 'Start / Options',
  10: 'L3',
  11: 'R3',
  12: 'D-Pad Up',
  13: 'D-Pad Down',
  14: 'D-Pad Left',
  15: 'D-Pad Right',
}

export function formatKeyCode(code: string): string {
  if (code.startsWith('Key')) return code.slice(3)
  if (code.startsWith('Digit')) return code.slice(5)
  const map: Record<string, string> = {
    Space: 'Space',
    Enter: 'Enter',
    Escape: 'Esc',
    Tab: 'Tab',
    ShiftLeft: 'Shift',
    ShiftRight: 'Shift',
    ControlLeft: 'Ctrl',
    ControlRight: 'Ctrl',
    AltLeft: 'Alt',
    AltRight: 'Alt',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Backspace: 'Bksp',
  }
  return map[code] ?? code
}
