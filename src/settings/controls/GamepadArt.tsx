import type { MouseEvent } from 'react'
import { DPAD_ACTIONS, packForFamily, type GamepadSpriteDef } from './gamepadAtlas'
import type { GamepadFamily } from './identifyGamepad'
import type { ControlAction } from './types'
import type { LivePadState } from './useGamepadInput'
import styles from './GamepadArt.module.css'

type GamepadArtProps = {
  family: GamepadFamily
  live: LivePadState | null
  listening: ControlAction | null
  onSelectAction: (action: ControlAction) => void
}

function isSpriteActive(sprite: GamepadSpriteDef, live: LivePadState | null) {
  if (!live) return false
  if (sprite.button != null && (live.pressed[sprite.button] ?? 0) > 0.08) return true
  if (sprite.buttons?.some((button) => (live.pressed[button] ?? 0) > 0.08)) return true
  return false
}

function stickAxes(sprite: GamepadSpriteDef, live: LivePadState | null) {
  if (!sprite.axes || !live) return { x: 0, y: 0, moving: false }
  const x = live.axes[sprite.axes[0]] ?? 0
  const y = live.axes[sprite.axes[1]] ?? 0
  return { x, y, moving: Math.abs(x) > 0.08 || Math.abs(y) > 0.08 }
}

export function GamepadArt({
  family,
  live,
  listening,
  onSelectAction,
}: GamepadArtProps) {
  const pack = packForFamily(family)

  const onDpadClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    let zone: 'up' | 'down' | 'left' | 'right' = 'up'
    if (Math.abs(x - 0.5) > Math.abs(y - 0.5)) {
      zone = x < 0.5 ? 'left' : 'right'
    } else {
      zone = y < 0.5 ? 'up' : 'down'
    }
    const hit = DPAD_ACTIONS.find((item) => item.zone === zone)
    if (hit) onSelectAction(hit.action)
  }

  return (
    <div className={styles.stage}>
      <img
        className={styles.base}
        src={pack.base}
        alt=""
        width={1280}
        height={720}
        draggable={false}
        decoding="async"
      />

      {pack.sprites.map((sprite) => {
        const active = isSpriteActive(sprite, live)
        const stick = stickAxes(sprite, live)
        const listeningHere =
          sprite.action != null && listening === sprite.action
            ? true
            : sprite.kind === 'dpad' &&
              DPAD_ACTIONS.some((item) => item.action === listening)

        const canClick = Boolean(sprite.action) || sprite.kind === 'dpad'

        return (
          <button
            key={sprite.id}
            type="button"
            className={[
              styles.layer,
              canClick ? styles.hit : styles.display,
              active ? styles.on : '',
              stick.moving ? styles.stickMoving : '',
              listeningHere ? styles.listening : '',
              sprite.kind === 'stick' ? styles.stick : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${sprite.rect.left}%`,
              top: `${sprite.rect.top}%`,
              width: `${sprite.rect.width}%`,
              height: `${sprite.rect.height}%`,
              ['--sx' as string]: `${stick.x * 22}%`,
              ['--sy' as string]: `${stick.y * 22}%`,
            }}
            disabled={!canClick}
            aria-label={sprite.id}
            onClick={
              sprite.kind === 'dpad'
                ? onDpadClick
                : () => {
                    if (sprite.action) onSelectAction(sprite.action)
                  }
            }
          >
            {/* CSS-only feedback — no cropped sprite overlays (they caused artifacts) */}
            <span className={styles.glow} aria-hidden="true" />
            {sprite.kind === 'stick' ? (
              <span className={styles.stickDot} aria-hidden="true" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
