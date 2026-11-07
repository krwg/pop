import { useT } from '@/i18n/hooks'
import styles from './SkipLink.module.css'

export function SkipLink() {
  const t = useT()

  return (
    <a className={styles.skip} href="#main">
      {t('a11y.skipToContent')}
    </a>
  )
}
