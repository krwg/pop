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
import styles from './StoreCard.module.css'

type StoreCardProps = {
  game: Game
  inLibrary: boolean
}

export function StoreCard({ game, inLibrary }: StoreCardProps) {
  const t = useT()
  const navigate = useNavigate()
  const platform = useClientPlatform()
  const compatible = isGameCompatible(game, platform)
  const { addToLibrary, removeFromLibrary } = useLibraryActions()
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
            label: t('store.openTitle'),
            onSelect: () => navigate(`/store/${game.slug}`),
          },
          inLibrary
            ? {
                id: 'in-library',
                label: t('store.inLibrary'),
                disabled: true,
                onSelect: () => undefined,
              }
            : {
                id: 'add',
                label: t('store.addToLibrary'),
                disabled: !compatible,
                onSelect: () => addToLibrary(game.id),
              },
          ...(inLibrary
            ? [
                {
                  id: 'play',
                  label: t('game.play'),
                  disabled: !compatible,
                  onSelect: () => navigate(`/play/${game.slug}`),
                },
                {
                  id: 'remove',
                  label: t('library.remove'),
                  danger: true,
                  onSelect: () => removeFromLibrary(game.id),
                },
              ]
            : []),
        ],
      })
    },
    [
      addToLibrary,
      compatible,
      game.id,
      game.slug,
      inLibrary,
      navigate,
      openMenu,
      removeFromLibrary,
      t,
    ],
  )

  return (
    <div data-context-own="true" className={styles.wrap}>
      <Link
        to={`/store/${game.slug}`}
        className={[styles.card, compatible ? '' : styles.blocked]
          .filter(Boolean)
          .join(' ')}
        aria-label={`${game.title}. ${t('store.openTitle')}`}
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
            </div>
          )}
          {inLibrary ? (
            <span className={styles.badge}>{t('store.inLibrary')}</span>
          ) : null}
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
