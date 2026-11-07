import { GAME_2048 } from '@/client/seed/g2048'
import type { Collection, Game, GameId, LibraryEntry } from '@/domain'

export type ClientState = {
  /** Catalog of known games (store source). */
  games: Record<string, Game>
  /** User library membership. */
  library: LibraryEntry[]
  /** Deferred feature — kept empty on purpose. */
  collections: Collection[]
}

export const initialClientState: ClientState = {
  games: {
    [GAME_2048.id]: GAME_2048,
  },
  library: [],
  collections: [],
}

export type ClientAction =
  | { type: 'games/upsert'; game: Game }
  | { type: 'games/remove'; gameId: GameId }
  | { type: 'library/add'; entry: LibraryEntry }
  | { type: 'library/remove'; gameId: GameId }
  | { type: 'collections/upsert'; collection: Collection }
  | { type: 'collections/remove'; collectionId: string }

export function clientReducer(
  state: ClientState,
  action: ClientAction,
): ClientState {
  switch (action.type) {
    case 'games/upsert':
      return {
        ...state,
        games: { ...state.games, [action.game.id]: action.game },
      }
    case 'games/remove': {
      const rest = { ...state.games }
      delete rest[action.gameId]
      return {
        ...state,
        games: rest,
        library: state.library.filter((item) => item.gameId !== action.gameId),
        collections: state.collections.map((collection) => ({
          ...collection,
          gameIds: collection.gameIds.filter((id) => id !== action.gameId),
        })),
      }
    }
    case 'library/add': {
      if (state.library.some((item) => item.gameId === action.entry.gameId)) {
        return state
      }
      return { ...state, library: [...state.library, action.entry] }
    }
    case 'library/remove':
      return {
        ...state,
        library: state.library.filter((item) => item.gameId !== action.gameId),
      }
    case 'collections/upsert':
      return {
        ...state,
        collections: [
          ...state.collections.filter(
            (collection) => collection.id !== action.collection.id,
          ),
          action.collection,
        ],
      }
    case 'collections/remove':
      return {
        ...state,
        collections: state.collections.filter(
          (collection) => collection.id !== action.collectionId,
        ),
      }
    default:
      return state
  }
}
