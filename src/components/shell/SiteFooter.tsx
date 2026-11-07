import { Link } from 'react-router-dom'
import { LocaleSwitcher } from '@/components/shell/LocaleSwitcher'
import { useT } from '@/i18n/hooks'
import styles from './SiteFooter.module.css'

const YEAR = 2026

export function SiteFooter() {
  const t = useT()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.tagline}>{t('footer.tagline')}</p>
          <p className={styles.rights}>
            © {YEAR} {t('footer.rights')}
          </p>
        </div>

        <div className={styles.meta}>
          <span className={styles.version}>[0.2.0]</span>
          <Link to="/about" className={styles.aboutLink}>
            {t('footer.aboutLink')}
          </Link>
          <LocaleSwitcher />
        </div>
      </div>
    </footer>
  )
}
