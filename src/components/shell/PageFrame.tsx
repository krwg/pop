import type { ReactNode } from 'react'
import styles from './PageFrame.module.css'

type PageFrameProps = {
  children: ReactNode
  className?: string
}

export function PageFrame({ children, className }: PageFrameProps) {
  const classes = [styles.frame, className].filter(Boolean).join(' ')
  return <div className={classes}>{children}</div>
}
