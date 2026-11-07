import type { CollectionId, GameId } from './ids'

export type Collection = {
  id: CollectionId
  title: string
  gameIds: GameId[]
  createdAt: string
  updatedAt: string
}
