import { useEffect, useMemo, useState } from 'react'
import keyboardBase from '@/assets/keyboard/base.png'
import { KEYBOARD_SPOTS } from './keyboardAtlas'
import type { ControlAction, ControlsConfig } from './types'
import styles from './KeyboardArt.module.css'

type KeyboardArtProps = {
  config: ControlsConfig
  listening: ControlAction | null
  onSelectAction: (action: ControlAction) => void
}

export function KeyboardArt({
  config,
  listening,
  onSelectAction,
}: KeyboardArtProps) {
  const [pressed, setPressed] = useState<Record<string, boolean>>({})

  const codeByAction = useMemo(() => {
    const map = new Map<string, ControlAction>()
    for (const [action, binding] of Object.entries(config.keyboard) as [
      ControlAction,
      ControlsConfig['keyboard'][ControlAction],
    ][]) {
      map.set(binding.code, action)
    }
    return map
  }, [config.keyboard])

  useEffect(() => {
    const onDown = (event: KeyboardEvent) => {
      setPressed((prev) => ({ ...prev, [event.code]: true }))
    }
    const onUp = (event: KeyboardEvent) => {
      setPressed((prev) => ({ ...prev, [event.code]: false }))
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  return (
    <div className={styles.stage}>
      <img
        className={styles.base}
        src={keyboardBase}
        alt=""
        width={1280}
        height={720}
        draggable={false}
        decoding="async"
      />

      {KEYBOARD_SPOTS.map((spot) => {
        const boundAction = spot.action ?? codeByAction.get(spot.code)
        const isDown = Boolean(pressed[spot.code])
        const isListening = boundAction != null && listening === boundAction
        const canClick = Boolean(boundAction)

        return (
          <button
            key={spot.id}
            type="button"
            className={[
              styles.key,
              isDown ? styles.on : '',
              isListening ? styles.listening : '',
              canClick ? styles.hit : styles.display,
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${spot.left}%`,
              top: `${spot.top}%`,
              width: `${spot.width}%`,
              height: `${spot.height}%`,
            }}
            disabled={!canClick}
            aria-label={spot.label}
            title={spot.label}
            onClick={() => {
              if (boundAction) onSelectAction(boundAction)
            }}
          >
            <span className={styles.glow} aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
