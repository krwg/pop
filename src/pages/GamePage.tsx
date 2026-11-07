import { Link, Navigate, useParams } from 'react-router-dom'
import {
  isGameCompatible,
  useClientPlatform,
} from '@/client/platform'
import { useGameBySlug, useIsInLibrary } from '@/client/store/hooks'
import { PlatformBadges } from '@/components/game/PlatformBadges'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { useT } from '@/i18n/hooks'
import { formatVersion } from '@/lib/formatVersion'
import { publicUrl } from '@/lib/publicUrl'
import styles from './GamePage.module.css'

export function GamePage() {
  const { slug } = useParams()
  const game = useGameBySlug(slug)
  const inLibrary = useIsInLibrary(game?.id ?? '')
  const platform = useClientPlatform()
  const t = useT()

  if (!game) {
    return <Navigate to="/library" replace />
  }

  if (!inLibrary) {
    return <Navigate to={`/store/${game.slug}`} replace />
  }

  const compatible = isGameCompatible(game, platform)
  const canPlay =
    compatible && game.runtime?.kind === 'web' && Boolean(game.runtime.entry)

  return (
    <article className={styles.page} aria-labelledby="game-title">
      <div className={styles.hero}>
        {game.libraryHero ? (
          <img
            className={styles.heroImage}
            src={publicUrl(game.libraryHero.src)}
            alt=""
            width={1920}
            height={620}
            decoding="async"
            fetchPriority="high"
          />
        ) : (
          <div className={styles.heroFallback} aria-hidden="true" />
        )}
        <div className={styles.heroVeil} aria-hidden="true" />

        <div className={styles.heroContent}>
          <Link to="/library" className={styles.back}>
            {t('game.backToLibrary')}
          </Link>

          <div className={styles.heroMain}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>{t('game.libraryLabel')}</p>
              <h1 id="game-title" className={styles.title}>
                {game.title}
              </h1>
              <PlatformBadges game={game} />
              {game.version ? (
                <p className={styles.version}>
                  {t('library.version')} {formatVersion(game.version)}
                </p>
              ) : null}
              {!compatible ? (
                <p className={styles.blocked}>{t('platform.blocked')}</p>
              ) : null}
            </div>

            <div className={styles.actions}>
              {canPlay ? (
                <ButtonLink to={`/play/${game.slug}`}>{t('game.play')}</ButtonLink>
              ) : (
                <p className={styles.unavailable}>
                  {compatible ? t('game.unavailable') : t('platform.blocked')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {game.summary ? (
        <div className={styles.below}>
          <p className={styles.summary}>{game.summary}</p>
        </div>
      ) : null}
    </article>
  )
}
