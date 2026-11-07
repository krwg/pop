import type { MessageKey } from '@/i18n'

export type NavItem = {
  id: 'home' | 'library' | 'store' | 'settings' | 'about'
  path: string
  labelKey: MessageKey
  icon: string
  end?: boolean
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    id: 'home',
    path: '/',
    labelKey: 'nav.home',
    icon: 'home',
    end: true,
  },
  {
    id: 'library',
    path: '/library',
    labelKey: 'nav.library',
    icon: 'grid_view',
  },
  {
    id: 'store',
    path: '/store',
    labelKey: 'nav.store',
    icon: 'storefront',
  },
  {
    id: 'settings',
    path: '/settings',
    labelKey: 'nav.settings',
    icon: 'tune',
  },
  {
    id: 'about',
    path: '/about',
    labelKey: 'nav.about',
    icon: 'info',
  },
] as const

export const BOOT_SESSION_KEY = 'pop:boot-complete'
