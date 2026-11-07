import styles from './Icon.module.css'

type IconProps = {
  name: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const SIZE_MAP = {
  sm: 18,
  md: 22,
  lg: 28,
} as const

export function Icon({ name, size = 'md', label, className }: IconProps) {
  const px = SIZE_MAP[size]
  const classes = [styles.icon, styles[size], className].filter(Boolean).join(' ')

  return (
    <span
      className={`material-symbols-outlined ${classes}`}
      style={{ fontSize: px, width: px, height: px }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  )
}
