export {
  isGameCompatible,
  isPcOnlyGame,
  resolveGamePlatforms,
} from './compat'
export { detectClientPlatform } from './detect'
export type {
  BrowserId,
  ClientPlatform,
  DeviceClass,
  GamePlatform,
  OsId,
} from './types'
export { DEFAULT_GAME_PLATFORMS } from './types'
export { useClientPlatform } from './useClientPlatform'
