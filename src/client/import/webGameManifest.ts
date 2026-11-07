import type { GamePlatform } from '@/domain'

/**
 * Import contract for web games.
 *
 * Package → Validation → Game → Store → LibraryEntry → WebRuntime
 *
 * Expected package layout:
 *   /games/<slug>/manifest.json
 *   /games/<slug>/<entry>
 *   /games/<slug>/<cover?>
 *   /games/<slug>/<libraryHero?>
 */
export type WebGameManifest = {
  id: string
  slug: string
  title: string
  version?: string
  summary?: string
  /** Entry HTML or bundle path relative to the game root. */
  entry: string
  cover?: string
  libraryHero?: string
  /**
   * Target platforms.
   * `web` = any browser; `pc` = desktop only; `mobile` = phone/tablet.
   */
  platforms?: GamePlatform[]
  /** Optional semver / integer runtime requirement for future shells. */
  minRuntime?: string
}

const PLATFORM_SET = new Set<GamePlatform>(['web', 'pc', 'mobile'])

export function isWebGameManifest(value: unknown): value is WebGameManifest {
  if (value == null || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.slug !== 'string' ||
    typeof candidate.title !== 'string' ||
    typeof candidate.entry !== 'string'
  ) {
    return false
  }

  if (candidate.platforms != null) {
    if (!Array.isArray(candidate.platforms) || candidate.platforms.length === 0) {
      return false
    }
    for (const item of candidate.platforms) {
      if (typeof item !== 'string' || !PLATFORM_SET.has(item as GamePlatform)) {
        return false
      }
    }
  }

  return true
}
