import { Link, type LinkProps } from 'react-router-dom'
import type { ReactNode } from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'ghost' | 'text'

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant
  children: ReactNode
  disabled?: boolean
}

export function ButtonLink({
  variant = 'primary',
  children,
  className,
  disabled,
  ...rest
}: ButtonLinkProps) {
  const classes = [
    styles.button,
    styles[variant],
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (disabled) {
    return (
      <span className={classes} aria-disabled="true">
        {children}
      </span>
    )
  }

  return (
    <Link className={classes} {...rest}>
      {children}
    </Link>
  )
}
