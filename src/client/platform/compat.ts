import type { Game } from '@/domain'
import { DEFAULT_GAME_PLATFORMS, type ClientPlatform, type GamePlatform } from './types'

export function resolveGamePlatforms(game: Pick<Game, 'platforms'>): GamePlatform[] {
  if (game.platforms && game.platforms.length > 0) return [...game.platforms]
  return [...DEFAULT_GAME_PLATFORMS]
}

/**
 * web → any device.
 * pc → desktop only.
 * mobile → phone/tablet only.
 */
export function isGameCompatible(
  game: Pick<Game, 'platforms'>,
  client: ClientPlatform,
): boolean {
  const platforms = resolveGamePlatforms(game)
  if (platforms.includes('web')) return true

  if (client.device === 'desktop') {
    return platforms.includes('pc')
  }

  return platforms.includes('mobile')
}

export function isPcOnlyGame(game: Pick<Game, 'platforms'>): boolean {
  const platforms = resolveGamePlatforms(game)
  return platforms.includes('pc') && !platforms.includes('web') && !platforms.includes('mobile')
}
