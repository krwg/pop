import type { Game } from '@/domain'
import { GameCard } from './GameCard'
import styles from './LibraryGrid.module.css'

type LibraryGridProps = {
  games: Game[]
  label: string
}

export function LibraryGrid({ games, label }: LibraryGridProps) {
  return (
    <section className={styles.section} aria-label={label}>
      <ul className={styles.grid}>
        {games.map((game) => (
          <li key={game.id} className={styles.item}>
            <GameCard game={game} />
          </li>
        ))}
      </ul>
    </section>
  )
}
