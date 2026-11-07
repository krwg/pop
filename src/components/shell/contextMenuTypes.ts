import type { ContextMenuItem } from '@/components/ui/ContextMenu'

export type ContextMenuRequest = {
  x: number
  y: number
  items: ContextMenuItem[]
}

export type ContextMenuOpenHandler = (request: ContextMenuRequest) => void
