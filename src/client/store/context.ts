import { createContext, type Dispatch } from 'react'
import type { ClientAction, ClientState } from './state'

export type ClientStoreValue = {
  state: ClientState
  dispatch: Dispatch<ClientAction>
}

export const ClientStoreContext = createContext<ClientStoreValue | null>(null)
