import { NavLink } from 'react-router-dom'
import { BrandMark } from '@/components/brand/BrandMark'
import { NAV_ITEMS } from '@/config/navigation'
import { useT } from '@/i18n/hooks'
import styles from './TopRail.module.css'

export function TopRail() {
  const t = useT()

  return (
    <header className={styles.rail}>
      <div className={styles.inner}>
        <div className={styles.brandRow}>
          <BrandMark size="md" />
        </div>

        <nav className={styles.nav} aria-label={t('nav.primary')}>
          <ul className={styles.list}>
            {NAV_ITEMS.map((item) => (
              <li key={item.id} className={styles.item}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    [styles.link, isActive ? styles.active : '']
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  <span className={styles.label}>{t(item.labelKey)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
