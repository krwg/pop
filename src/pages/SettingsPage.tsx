import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { PageFrame } from '@/components/shell/PageFrame'
import { useT } from '@/i18n/hooks'
import { ControlsPanel } from '@/settings/controls/ControlsPanel'
import { ImportPanel } from '@/settings/import/ImportPanel'
import { SettingsHome } from './SettingsHome'
import styles from './SettingsPage.module.css'

export function SettingsPage() {
  const t = useT()
  const location = useLocation()
  const isOverview = location.pathname === '/settings' || location.pathname === '/settings/'

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 id="settings-title" className={styles.title}>
            {t('pages.settings.title')}
          </h1>
          {isOverview ? (
            <p className={styles.lead}>{t('pages.settings.lead')}</p>
          ) : null}
        </header>

        <div className={styles.body}>
          <nav className={styles.subnav} aria-label={t('settings.navLabel')}>
            <NavLink
              to="/settings"
              end
              className={({ isActive }) =>
                [styles.subLink, isActive ? styles.subActive : '']
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {t('settings.home.nav')}
            </NavLink>
            <NavLink
              to="/settings/controls"
              className={({ isActive }) =>
                [styles.subLink, isActive ? styles.subActive : '']
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {t('settings.controls.nav')}
            </NavLink>
            <NavLink
              to="/settings/import"
              className={({ isActive }) =>
                [styles.subLink, isActive ? styles.subActive : '']
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {t('settings.import.nav')}
            </NavLink>
          </nav>

          <div className={styles.content}>
            <Routes>
              <Route index element={<SettingsHome />} />
              <Route path="controls" element={<ControlsPanel />} />
              <Route path="import" element={<ImportPanel />} />
            </Routes>
          </div>
        </div>
      </div>
    </PageFrame>
  )
}
