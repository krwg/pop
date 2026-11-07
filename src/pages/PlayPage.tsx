import { Link, Navigate, useParams } from 'react-router-dom'
import {
  isGameCompatible,
  useClientPlatform,
} from '@/client/platform'
import { useGameBySlug } from '@/client/store/hooks'
import { useT } from '@/i18n/hooks'
import { publicUrl } from '@/lib/publicUrl'
import styles from './PlayPage.module.css'

export function PlayPage() {
  const { slug } = useParams()
  const game = useGameBySlug(slug)
  const platform = useClientPlatform()
  const t = useT()

  if (!game || game.runtime?.kind !== 'web' || !game.runtime.entry) {
    return <Navigate to="/library" replace />
  }

  if (!isGameCompatible(game, platform)) {
    return <Navigate to={`/game/${game.slug}`} replace />
  }

  return (
    <div className={styles.play}>
      <header className={styles.bar}>
        <Link to={`/game/${game.slug}`} className={styles.back}>
          {t('game.backToGame')}
        </Link>
        <p className={styles.title}>{game.title}</p>
      </header>
      <iframe
        className={styles.frame}
        title={game.title}
        src={publicUrl(game.runtime.entry)}
        allow="fullscreen; gamepad; autoplay"
      />
    </div>
  )
}
