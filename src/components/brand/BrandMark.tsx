import { Link } from 'react-router-dom'
import brandMark from '@/assets/brand-mark.png'
import { useT } from '@/i18n/hooks'
import styles from './BrandMark.module.css'

type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg'
  to?: string
  interactive?: boolean
  stacked?: boolean
  align?: 'start' | 'center'
}

export function BrandMark({
  size = 'md',
  to = '/',
  interactive = true,
  stacked = false,
  align = 'start',
}: BrandMarkProps) {
  const t = useT()
  const classes = [
    styles.brand,
    styles[size],
    stacked ? styles.stacked : styles.inline,
    align === 'center' ? styles.alignCenter : '',
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <img
        className={styles.mark}
        src={brandMark}
        alt=""
        width={64}
        height={64}
        decoding="async"
      />
      <span className={styles.wordmark}>
        <span className={styles.linePrimary}>{t('brand.name')}</span>
      </span>
    </>
  )

  if (!interactive) {
    return (
      <div className={classes} aria-label={t('brand.name')}>
        {content}
      </div>
    )
  }

  return (
    <Link to={to} className={classes} aria-label={t('brand.name')}>
      {content}
    </Link>
  )
}
