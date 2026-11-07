import { useCallback, useEffect, useRef, useState } from 'react'
import { BOOT_SESSION_KEY } from '@/config/navigation'
import { useT } from '@/i18n/hooks'
import styles from './BootSequence.module.css'

type BootSequenceProps = {
  onComplete: () => void
}

function hasCompletedBoot(): boolean {
  try {
    return sessionStorage.getItem(BOOT_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function markBootComplete() {
  try {
    sessionStorage.setItem(BOOT_SESSION_KEY, '1')
  } catch {
    // Ignore storage failures; boot simply will replay next time.
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const t = useT()
  const [visible, setVisible] = useState(() => !hasCompletedBoot())
  const [exiting, setExiting] = useState(false)
  const completedRef = useRef(false)
  const exitTimerRef = useRef<number | null>(null)

  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    markBootComplete()
    setExiting(true)
    onComplete()

    const exitMs = prefersReducedMotion() ? 120 : 520
    exitTimerRef.current = window.setTimeout(() => {
      setVisible(false)
    }, exitMs)
  }, [onComplete])

  useEffect(() => {
    if (!visible) {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete()
      }
      return
    }

    const reduced = prefersReducedMotion()
    const autoMs = reduced ? 280 : 3600
    const autoTimer = window.setTimeout(finish, autoMs)

    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' ||
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'Spacebar'
      ) {
        event.preventDefault()
        finish()
      }
    }

    window.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(autoTimer)
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current)
      window.removeEventListener('keydown', onKey)
    }
  }, [finish, onComplete, visible])

  if (!visible) return null

  return (
    <div
      className={[styles.boot, exiting ? styles.exiting : ''].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label="PILLARS OF PIXELS"
      onClick={finish}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') finish()
      }}
      tabIndex={0}
    >
      <div className={styles.stage}>
        <div className={styles.mark} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className={styles.word}>PILLARS OF PIXELS</p>
        <p className={styles.hint}>{t('boot.skipHint')}</p>
      </div>
    </div>
  )
}
