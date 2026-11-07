import type { ReactNode } from 'react'
import emptyAbstract from '@/assets/empty-abstract.png'
import styles from './EmptyState.module.css'

export type EmptyAccent = 'library' | 'store' | 'about'

type EmptyStateProps = {
  titleId: string
  title: string
  lead: string
  note: string
  accent: EmptyAccent
  action?: ReactNode
}

export function EmptyState({
  titleId,
  title,
  lead,
  note,
  accent,
  action,
}: EmptyStateProps) {
  return (
    <section
      className={[styles.state, styles[accent]].join(' ')}
      aria-labelledby={titleId}
    >
      <div className={styles.visual} aria-hidden="true">
        <img
          className={styles.art}
          src={emptyAbstract}
          alt=""
          width={1536}
          height={1536}
          decoding="async"
        />
      </div>

      <div className={styles.copy}>
        <h1 id={titleId} className={styles.title}>
          {title}
        </h1>
        <p className={styles.lead}>{lead}</p>
        <p className={styles.note}>{note}</p>
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>
    </section>
  )
}
