import { useEffect } from 'react'
import type { ContextMenuItem } from '@/components/ui/ContextMenu'
import { useContextMenuBus } from '@/components/shell/ContextMenuBus'

/** Register page-level RMB extras (merged above global nav). */
export function usePageContextItems(items: ContextMenuItem[]) {
  const { setPageItems } = useContextMenuBus()

  useEffect(() => {
    setPageItems(items)
    return () => setPageItems([])
  }, [items, setPageItems])
}
