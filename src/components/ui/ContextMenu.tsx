import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import styles from './ContextMenu.module.css'

export type ContextMenuItem = {
  id: string
  label: string
  disabled?: boolean
  danger?: boolean
  onSelect: () => void
}

type ContextMenuProps = {
  x: number
  y: number
  items: ContextMenuItem[]
  labelledBy?: string
  onClose: () => void
}

export function ContextMenu({ x, y, items, labelledBy, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: x, top: y })

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const pad = 8
    setPos({
      left: Math.min(x, window.innerWidth - rect.width - pad),
      top: Math.min(y, window.innerHeight - rect.height - pad),
    })
  }, [x, y, items.length])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const onPointer = () => onClose()
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className={styles.menu}
      role="menu"
      aria-labelledby={labelledBy}
      style={{ left: pos.left, top: pos.top }}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          className={[styles.item, item.danger ? styles.danger : '']
            .filter(Boolean)
            .join(' ')}
          disabled={item.disabled}
          onClick={() => {
            if (item.disabled) return
            item.onSelect()
            onClose()
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

type ContextMenuPortalProps = {
  open: boolean
  children: ReactNode
}

export function ContextMenuLayer({ open, children }: ContextMenuPortalProps) {
  if (!open) return null
  return <div className={styles.layer}>{children}</div>
}
