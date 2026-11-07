import type { GamePlatform } from '@/domain'

export type { GamePlatform }

export type DeviceClass = 'mobile' | 'tablet' | 'desktop'

export type BrowserId =
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'opera'
  | 'other'

export type OsId =
  | 'windows'
  | 'macos'
  | 'linux'
  | 'android'
  | 'ios'
  | 'other'

export type ClientPlatform = {
  device: DeviceClass
  browser: BrowserId
  browserLabel: string
  os: OsId
  isTouch: boolean
  userAgent: string
}

export const DEFAULT_GAME_PLATFORMS: readonly GamePlatform[] = ['web'] as const
