import type { GamepadFamily } from './identifyGamepad'
import type { ControlAction } from './types'

import xboxBase from '@/assets/gamepad/xbox/base.png'
import psBase from '@/assets/gamepad/ps/base.png'

export type SpriteRect = {
  left: number
  top: number
  width: number
  height: number
}

export type GamepadSpriteDef = {
  id: string
  button: number | null
  buttons?: number[]
  action?: ControlAction
  axes?: [number, number]
  kind: 'button' | 'stick' | 'dpad'
  rect: SpriteRect
}

type Pack = {
  base: string
  sprites: readonly GamepadSpriteDef[]
}

const XBOX: Pack = {
  base: xboxBase,
  sprites: [
    { id: 'lb', button: 4, kind: 'button', rect: { left: 21.875, top: 9.722, width: 14.844, height: 9.722 } },
    { id: 'rb', button: 5, kind: 'button', rect: { left: 62.5, top: 9.722, width: 14.844, height: 9.722 } },
    { id: 'stick-l', button: 10, kind: 'stick', axes: [0, 1], rect: { left: 23.438, top: 27.778, width: 12.5, height: 22.222 } },
    { id: 'stick-r', button: 11, kind: 'stick', axes: [2, 3], rect: { left: 57.031, top: 51.389, width: 12.5, height: 22.222 } },
    { id: 'btn-y', button: 3, action: 'actionSecondary', kind: 'button', rect: { left: 67.969, top: 24.306, width: 7.813, height: 13.889 } },
    { id: 'btn-x', button: 2, action: 'actionPrimary', kind: 'button', rect: { left: 62.891, top: 33.333, width: 7.813, height: 13.889 } },
    { id: 'btn-b', button: 1, action: 'cancel', kind: 'button', rect: { left: 73.047, top: 33.333, width: 7.813, height: 13.889 } },
    { id: 'btn-a', button: 0, action: 'confirm', kind: 'button', rect: { left: 67.969, top: 42.361, width: 7.813, height: 13.889 } },
    { id: 'dpad', button: null, buttons: [12, 13, 14, 15], kind: 'dpad', rect: { left: 25, top: 51.389, width: 11.719, height: 20.833 } },
    { id: 'view', button: 8, kind: 'button', rect: { left: 42.578, top: 32.639, width: 5.469, height: 7.639 } },
    { id: 'menu', button: 9, action: 'menu', kind: 'button', rect: { left: 51.172, top: 32.639, width: 5.469, height: 7.639 } },
  ],
}

const PS: Pack = {
  base: psBase,
  sprites: [
    { id: 'lb', button: 4, kind: 'button', rect: { left: 22.656, top: 9.722, width: 14.063, height: 9.028 } },
    { id: 'rb', button: 5, kind: 'button', rect: { left: 62.5, top: 9.722, width: 14.063, height: 9.028 } },
    { id: 'stick-l', button: 10, kind: 'stick', axes: [0, 1], rect: { left: 26.563, top: 52.778, width: 11.719, height: 20.833 } },
    { id: 'stick-r', button: 11, kind: 'stick', axes: [2, 3], rect: { left: 54.688, top: 52.778, width: 11.719, height: 20.833 } },
    { id: 'btn-y', button: 3, action: 'actionSecondary', kind: 'button', rect: { left: 68.75, top: 24.306, width: 7.422, height: 13.194 } },
    { id: 'btn-x', button: 2, action: 'actionPrimary', kind: 'button', rect: { left: 64.063, top: 32.639, width: 7.422, height: 13.194 } },
    { id: 'btn-b', button: 1, action: 'cancel', kind: 'button', rect: { left: 73.438, top: 32.639, width: 7.422, height: 13.194 } },
    { id: 'btn-a', button: 0, action: 'confirm', kind: 'button', rect: { left: 68.75, top: 40.972, width: 7.422, height: 13.194 } },
    { id: 'dpad', button: null, buttons: [12, 13, 14, 15], kind: 'dpad', rect: { left: 23.438, top: 25, width: 11.719, height: 20.833 } },
    { id: 'view', button: 8, kind: 'button', rect: { left: 40.625, top: 41.667, width: 5.469, height: 6.944 } },
    { id: 'menu', button: 9, action: 'menu', kind: 'button', rect: { left: 53.125, top: 41.667, width: 5.469, height: 6.944 } },
  ],
}

export function packForFamily(family: GamepadFamily): Pack {
  return family === 'playstation' ? PS : XBOX
}

export const DPAD_ACTIONS: {
  action: ControlAction
  button: number
  zone: 'up' | 'down' | 'left' | 'right'
}[] = [
  { action: 'moveUp', button: 12, zone: 'up' },
  { action: 'moveDown', button: 13, zone: 'down' },
  { action: 'moveLeft', button: 14, zone: 'left' },
  { action: 'moveRight', button: 15, zone: 'right' },
]
