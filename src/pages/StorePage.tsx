import { useIsInLibrary, useStoreGames } from '@/client/store/hooks'
import { PageFrame } from '@/components/shell/PageFrame'
import { StoreCard } from '@/components/store/StoreCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { useT } from '@/i18n/hooks'
import styles from './StorePage.module.css'

export function StorePage() {
  const t = useT()
  const games = useStoreGames()

  if (games.length === 0) {
    return (
      <PageFrame>
        <EmptyState
          accent="store"
          titleId="store-title"
          title={t('store.title')}
          lead={t('store.lead')}
          note={t('store.emptyNote')}
        />
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <header className={styles.header}>
        <h1 id="store-title" className={styles.title}>
          {t('store.title')}
        </h1>
        <p className={styles.lead}>{t('store.lead')}</p>
      </header>
      <ul className={styles.grid}>
        {games.map((game) => (
          <StoreCardItem key={game.id} gameId={game.id} game={game} />
        ))}
      </ul>
    </PageFrame>
  )
}

function StoreCardItem({
  game,
  gameId,
}: {
  game: ReturnType<typeof useStoreGames>[number]
  gameId: string
}) {
  const inLibrary = useIsInLibrary(gameId)
  return (
    <li className={styles.item}>
      <StoreCard game={game} inLibrary={inLibrary} />
    </li>
  )
}
