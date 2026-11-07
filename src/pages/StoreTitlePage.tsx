import { useCallback, type MouseEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  isGameCompatible,
  useClientPlatform,
} from '@/client/platform'
import {
  useGameBySlug,
  useIsInLibrary,
  useLibraryActions,
} from '@/client/store/hooks'
import { PlatformBadges } from '@/components/game/PlatformBadges'
import { useContextMenuBus } from '@/components/shell/ContextMenuBus'
import { PageFrame } from '@/components/shell/PageFrame'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { useT } from '@/i18n/hooks'
import { publicUrl } from '@/lib/publicUrl'
import styles from './StoreTitlePage.module.css'

export function StoreTitlePage() {
  const { slug } = useParams()
  const game = useGameBySlug(slug)
  const t = useT()
  const navigate = useNavigate()
  const platform = useClientPlatform()
  const { addToLibrary, removeFromLibrary } = useLibraryActions()
  const inLibrary = useIsInLibrary(game?.id ?? '')
  const { openMenu } = useContextMenuBus()

  const onContextMenu = useCallback(
    (event: MouseEvent) => {
      if (!game) return
      event.preventDefault()
      event.stopPropagation()
      const compatible = isGameCompatible(game, platform)
      openMenu({
        x: event.clientX,
        y: event.clientY,
        items: [
          inLibrary
            ? {
                id: 'open-library',
                label: t('library.openGame'),
                disabled: !compatible,
                onSelect: () => navigate(`/game/${game.slug}`),
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
          {
            id: 'back-store',
            label: t('store.title'),
            onSelect: () => navigate('/store'),
          },
        ],
      })
    },
    [
      addToLibrary,
      game,
      inLibrary,
      navigate,
      openMenu,
      platform,
      removeFromLibrary,
      t,
    ],
  )

  if (!game) {
    return <Navigate to="/store" replace />
  }

  const compatible = isGameCompatible(game, platform)
  const initial = game.title.slice(0, 1).toUpperCase()

  return (
    <PageFrame>
      <article
        className={styles.page}
        aria-labelledby="store-title"
        data-context-own="true"
        onContextMenu={onContextMenu}
      >
        <div className={styles.visual} aria-hidden="true">
          {game.cover ? (
            <img
              className={styles.cover}
              src={publicUrl(game.cover.src)}
              alt=""
              width={600}
              height={900}
              decoding="async"
            />
          ) : (
            <div className={styles.coverFallback}>
              <span className={styles.coverInitial}>{initial}</span>
            </div>
          )}
        </div>

        <div className={styles.copy}>
          <Link to="/store" className={styles.back}>
            {t('store.title')}
          </Link>

          <h1 id="store-title" className={styles.title}>
            {game.title}
          </h1>

          <PlatformBadges game={game} />

          {game.summary ? <p className={styles.summary}>{game.summary}</p> : null}

          {!compatible ? (
            <p className={styles.blocked}>{t('platform.blocked')}</p>
          ) : null}

          <div className={styles.actions}>
            {inLibrary ? (
              <>
                <ButtonLink to={`/game/${game.slug}`} disabled={!compatible}>
                  {t('store.inLibrary')}
                </ButtonLink>
                {compatible ? (
                  <ButtonLink to={`/play/${game.slug}`} variant="ghost">
                    {t('game.play')}
                  </ButtonLink>
                ) : null}
              </>
            ) : (
              <Button
                type="button"
                disabled={!compatible}
                onClick={() => {
                  if (!compatible) return
                  addToLibrary(game.id)
                }}
              >
                {t('store.addToLibrary')}
              </Button>
            )}
          </div>
        </div>
      </article>
    </PageFrame>
  )
}
