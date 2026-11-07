import { Link } from 'react-router-dom'
import { useClientPlatform } from '@/client/platform'
import { useT } from '@/i18n/hooks'
import styles from './SettingsHome.module.css'

export function SettingsHome() {
  const t = useT()
  const platform = useClientPlatform()

  return (
    <div className={styles.home}>
      <section className={styles.block} aria-labelledby="env-title">
        <h2 id="env-title" className={styles.blockTitle}>
          {t('settings.home.envTitle')}
        </h2>
        <dl className={styles.meta}>
          <div>
            <dt>{t('settings.home.device')}</dt>
            <dd>{t(`platform.device.${platform.device}`)}</dd>
          </div>
          <div>
            <dt>{t('settings.home.browser')}</dt>
            <dd>
              {platform.browserLabel} · {t(`platform.os.${platform.os}`)}
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.block} aria-labelledby="sections-title">
        <h2 id="sections-title" className={styles.blockTitle}>
          {t('settings.home.sectionsTitle')}
        </h2>
        <ul className={styles.links}>
          <li>
            <Link to="/settings/controls" className={styles.link}>
              <span className={styles.linkTitle}>{t('settings.controls.nav')}</span>
              <span className={styles.linkText}>{t('settings.home.controlsText')}</span>
            </Link>
          </li>
          <li>
            <Link to="/settings/import" className={styles.link}>
              <span className={styles.linkTitle}>{t('settings.import.nav')}</span>
              <span className={styles.linkText}>{t('settings.home.importText')}</span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}
