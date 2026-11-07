import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from '@/config/navigation'
import { useT } from '@/i18n/hooks'
import { ContextMenu, type ContextMenuItem } from '@/components/ui/ContextMenu'
import type { ContextMenuOpenHandler, ContextMenuRequest } from './contextMenuTypes'

type ContextMenuBusValue = {
  openMenu: ContextMenuOpenHandler
  closeMenu: () => void
  setPageItems: (items: ContextMenuItem[]) => void
}

const ContextMenuBusContext = createContext<ContextMenuBusValue | null>(null)

export function useContextMenuBus() {
  const ctx = useContext(ContextMenuBusContext)
  if (!ctx) {
    throw new Error('useContextMenuBus must be used within ContextMenuBusProvider')
  }
  return ctx
}

export function ContextMenuBusProvider({ children }: { children: ReactNode }) {
  const t = useT()
  const navigate = useNavigate()
  const location = useLocation()
  const [menu, setMenu] = useState<ContextMenuRequest | null>(null)
  const [pageItems, setPageItemsState] = useState<ContextMenuItem[]>([])

  const closeMenu = useCallback(() => setMenu(null), [])
  const openMenu = useCallback<ContextMenuOpenHandler>((request) => {
    setMenu(request)
  }, [])
  const setPageItems = useCallback((items: ContextMenuItem[]) => {
    setPageItemsState(items)
  }, [])

  const navItems = useMemo<ContextMenuItem[]>(
    () =>
      NAV_ITEMS.map((item) => ({
        id: `nav:${item.id}`,
        label: t(item.labelKey),
        disabled: item.end
          ? location.pathname === item.path
          : location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`),
        onSelect: () => navigate(item.path),
      })),
    [location.pathname, navigate, t],
  )

  useEffect(() => {
    closeMenu()
    setPageItemsState([])
  }, [location.pathname, closeMenu])

  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[data-context-own="true"]')) return
      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        return
      }

      event.preventDefault()
      const items =
        pageItems.length > 0 ? [...pageItems, ...navItems] : [...navItems]
      openMenu({ x: event.clientX, y: event.clientY, items })
    }

    document.addEventListener('contextmenu', onContextMenu)
    return () => document.removeEventListener('contextmenu', onContextMenu)
  }, [navItems, pageItems, openMenu])

  const value = useMemo(
    () => ({ openMenu, closeMenu, setPageItems }),
    [openMenu, closeMenu, setPageItems],
  )

  return (
    <ContextMenuBusContext.Provider value={value}>
      {children}
      {menu ? (
        <ContextMenu x={menu.x} y={menu.y} items={menu.items} onClose={closeMenu} />
      ) : null}
    </ContextMenuBusContext.Provider>
  )
}
