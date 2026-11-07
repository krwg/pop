import { useCallback, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  isGameCompatible,
  useClientPlatform,
} from '@/client/platform'
import { useLibraryActions } from '@/client/store/hooks'
import { useContextMenuBus } from '@/components/shell/ContextMenuBus'
import type { Game } from '@/domain'
import { useT } from '@/i18n/hooks'
import { publicUrl } from '@/lib/publicUrl'
import styles from './GameCard.module.css'

type GameCardProps = {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const t = useT()
  const navigate = useNavigate()
  const platform = useClientPlatform()
  const compatible = isGameCompatible(game, platform)
  const { removeFromLibrary } = useLibraryActions()
  const { openMenu } = useContextMenuBus()

  const onContextMenu = useCallback(
    (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      openMenu({
        x: event.clientX,
        y: event.clientY,
        items: [
          {
            id: 'open',
            label: t('library.openGame'),
            disabled: !compatible,
            onSelect: () => navigate(`/game/${game.slug}`),
          },
          {
            id: 'play',
            label: t('game.play'),
            disabled: !compatible,
            onSelect: () => navigate(`/play/${game.slug}`),
          },
          {
            id: 'store',
            label: t('store.openTitle'),
            onSelect: () => navigate(`/store/${game.slug}`),
          },
          {
            id: 'remove',
            label: t('library.remove'),
            danger: true,
            onSelect: () => {
              removeFromLibrary(game.id)
              navigate('/library')
            },
          },
        ],
      })
    },
    [compatible, game.id, game.slug, navigate, openMenu, removeFromLibrary, t],
  )

  return (
    <div className={styles.wrap} data-context-own="true">
      <Link
        to={compatible ? `/game/${game.slug}` : `/store/${game.slug}`}
        className={[styles.card, compatible ? '' : styles.blocked]
          .filter(Boolean)
          .join(' ')}
        aria-label={`${game.title}. ${t('library.openGame')}`}
        aria-haspopup="menu"
        onContextMenu={onContextMenu}
      >
        <div className={styles.cover} aria-hidden="true">
          {game.cover ? (
            <img
              className={styles.coverImage}
              src={publicUrl(game.cover.src)}
              alt=""
              width={600}
              height={900}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className={styles.coverFallback}>
              <span className={styles.coverInitial}>
                {game.title.slice(0, 1).toUpperCase()}
              </span>
              <span className={styles.coverGlow} />
            </div>
          )}
        </div>
        <div className={styles.meta}>
          <h2 className={styles.title}>{game.title}</h2>
          {!compatible ? (
            <p className={styles.blockedNote}>{t('platform.blockedShort')}</p>
          ) : null}
        </div>
      </Link>
    </div>
  )
}
