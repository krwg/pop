import type { GameId } from './ids'

/** Target device class for a title. */
export type GamePlatform = 'web' | 'pc' | 'mobile'

/** Future media reference — no fake assets required now. */
export type MediaRef = {
  src: string
  alt?: string
}

/**
 * Web runtime — ready for future import of web games.
 * Installation / native runtimes will extend this union later.
 */
export type WebRuntime = {
  kind: 'web'
  /** Absolute URL or app-relative path to the game entry. */
  entry: string
}

export type GameRuntime = WebRuntime

export type Game = {
  id: GameId
  slug: string
  title: string
  summary?: string
  /** Library card portrait, target 600×900. */
  cover?: MediaRef
  /** Library game page hero, target 1920×620. */
  libraryHero?: MediaRef
  runtime?: GameRuntime
  version?: string
  /**
   * Target platforms.
   * `web` = any browser device; `pc` = desktop only; `mobile` = phone/tablet.
   * Defaults to `['web']` when omitted.
   */
  platforms?: GamePlatform[]
}
