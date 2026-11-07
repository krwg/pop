export type GameId = string & { readonly __brand: 'GameId' }
export type CollectionId = string & { readonly __brand: 'CollectionId' }

export function asGameId(value: string): GameId {
  return value as GameId
}

export function asCollectionId(value: string): CollectionId {
  return value as CollectionId
}
