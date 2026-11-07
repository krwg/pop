import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useGameBySlug } from '@/client/store/hooks'
import type { MessageKey } from '@/i18n'
import { useT } from '@/i18n/hooks'

const TITLE_BY_PATH: Record<string, MessageKey | null> = {
  '/': null,
  '/library': 'pages.library.title',
  '/store': 'pages.store.title',
  '/settings': 'pages.settings.title',
  '/settings/controls': 'settings.controls.title',
  '/settings/import': 'settings.import.title',
  '/about': 'pages.about.title',
}

function readSlug(pathname: string, prefix: string): string | undefined {
  if (!pathname.startsWith(prefix)) return undefined
  const slug = pathname.slice(prefix.length).split('/')[0]
  return slug || undefined
}

export function DocumentTitle() {
  const location = useLocation()
  const t = useT()
  const gameSlug =
    readSlug(location.pathname, '/game/') ??
    readSlug(location.pathname, '/play/') ??
    readSlug(location.pathname, '/store/')
  const game = useGameBySlug(gameSlug)

  useEffect(() => {
    const brand = t('brand.name')

    if (game) {
      document.title = `${game.title} · ${brand}`
      return
    }

    const key = TITLE_BY_PATH[location.pathname]
    document.title = key ? `${t(key)} · ${brand}` : brand
  }, [game, location.pathname, t])

  return null
}
