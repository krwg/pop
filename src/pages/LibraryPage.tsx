import { useIsLibraryEmpty, useLibraryGames } from '@/client/store/hooks'
import { LibraryGrid } from '@/components/library/LibraryGrid'
import { PageFrame } from '@/components/shell/PageFrame'
import { EmptyState } from '@/components/ui/EmptyState'
import { useT } from '@/i18n/hooks'
import styles from './LibraryPage.module.css'

export function LibraryPage() {
  const t = useT()
  const isEmpty = useIsLibraryEmpty()
  const games = useLibraryGames()

  if (isEmpty) {
    return (
      <PageFrame>
        <EmptyState
          accent="library"
          titleId="library-title"
          title={t('pages.library.title')}
          lead={t('library.emptyLead')}
          note={t('library.emptyNote')}
        />
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <header className={styles.header}>
        <h1 id="library-title" className={styles.title}>
          {t('pages.library.title')}
        </h1>
        <p className={styles.count}>
          {t('library.count')}: {games.length}
        </p>
      </header>
      <LibraryGrid games={games} label={t('pages.library.title')} />
    </PageFrame>
  )
}
