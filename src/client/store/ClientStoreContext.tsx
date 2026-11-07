import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { ClientStoreContext } from './context'
import { loadPersistedClientState, persistClientState } from './persist'
import { clientReducer } from './state'

type ClientStoreProviderProps = {
  children: ReactNode
}

export function ClientStoreProvider({ children }: ClientStoreProviderProps) {
  const [state, dispatch] = useReducer(clientReducer, undefined, loadPersistedClientState)

  useEffect(() => {
    persistClientState(state)
  }, [state])

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  )

  return (
    <ClientStoreContext.Provider value={value}>
      {children}
    </ClientStoreContext.Provider>
  )
}
