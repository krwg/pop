import type { ClientState } from './state'
import { initialClientState } from './state'

const STORAGE_KEY = 'pop:client-state-v1'

type PersistedSlice = {
  library: ClientState['library']
  collections: ClientState['collections']
}

export function loadPersistedClientState(): ClientState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialClientState
    const parsed = JSON.parse(raw) as PersistedSlice
    return {
      ...initialClientState,
      library: Array.isArray(parsed.library) ? parsed.library : [],
      collections: Array.isArray(parsed.collections) ? parsed.collections : [],
    }
  } catch {
    return initialClientState
  }
}

export function persistClientState(state: ClientState) {
  const slice: PersistedSlice = {
    library: state.library,
    collections: state.collections,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slice))
  } catch {
    /* quota / private mode */
  }
}
