import { useContext, useMemo } from 'react'
import { detectClientPlatform, isGameCompatible } from '@/client/platform'
import type { Collection, Game, LibraryEntry } from '@/domain'
import { ClientStoreContext } from './context'

export function useClientStore() {
  const ctx = useContext(ClientStoreContext)
  if (!ctx) {
    throw new Error('useClientStore must be used within ClientStoreProvider')
  }
  return ctx
}

export function useLibraryEntries(): LibraryEntry[] {
  return useClientStore().state.library
}

export function useIsLibraryEmpty(): boolean {
  return useLibraryEntries().length === 0
}

export function useLibraryGames(): Game[] {
  const { games, library } = useClientStore().state
  return useMemo(
    () =>
      library
        .map((entry) => games[entry.gameId])
        .filter((game): game is Game => game != null),
    [games, library],
  )
}

export function useGameBySlug(slug: string | undefined): Game | undefined {
  const { games } = useClientStore().state
  return useMemo(() => {
    if (!slug) return undefined
    return Object.values(games).find((game) => game.slug === slug)
  }, [games, slug])
}

export function useCollections(): Collection[] {
  return useClientStore().state.collections
}

export function useIsCollectionsEmpty(): boolean {
  return useCollections().length === 0
}

export function useGames(): Game[] {
  const { games } = useClientStore().state
  return useMemo(() => Object.values(games), [games])
}

export function useStoreGames(): Game[] {
  return useGames()
}

export function useIsInLibrary(gameId: string): boolean {
  const { library } = useClientStore().state
  return library.some((entry) => entry.gameId === gameId)
}

export function useLibraryActions() {
  const { state, dispatch } = useClientStore()

  return useMemo(
    () => ({
      addToLibrary(gameId: Game['id']) {
        const game = state.games[gameId]
        if (!game) return
        if (!isGameCompatible(game, detectClientPlatform())) return
        dispatch({
          type: 'library/add',
          entry: {
            gameId,
            addedAt: new Date().toISOString(),
          },
        })
      },
      removeFromLibrary(gameId: Game['id']) {
        dispatch({ type: 'library/remove', gameId })
      },
    }),
    [dispatch, state.games],
  )
}
