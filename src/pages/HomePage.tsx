import { Link } from 'react-router-dom'
import { AmbientPlane } from '@/components/home/AmbientPlane'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { useT } from '@/i18n/hooks'
import styles from './HomePage.module.css'

const ANCHORS = [
  {
    id: 'library',
    to: '/library',
    titleKey: 'pages.home.libraryTitle',
    textKey: 'pages.home.libraryText',
  },
  {
    id: 'store',
    to: '/store',
    titleKey: 'pages.home.storeTitle',
    textKey: 'pages.home.storeText',
  },
  {
    id: 'about',
    to: '/about',
    titleKey: 'pages.home.aboutTitle',
    textKey: 'pages.home.aboutText',
  },
] as const

export function HomePage() {
  const t = useT()

  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-brand">
        <div className={styles.visual}>
          <AmbientPlane />
        </div>

        <div className={styles.copy}>
          <h1 id="home-brand" className={styles.brand}>
            <span className={styles.brandLine}>PILLARS</span>
            <span className={styles.brandLine}>OF PIXELS</span>
          </h1>
          <p className={styles.lead}>{t('pages.home.lead')}</p>
          <div className={styles.actions}>
            <ButtonLink to="/library">{t('pages.home.cta')}</ButtonLink>
          </div>
        </div>
      </section>

      <section className={styles.anchors} aria-labelledby="home-anchors-label">
        <div className={styles.anchorsInner}>
          <p id="home-anchors-label" className={styles.anchorsLabel}>
            {t('pages.home.anchorsLabel')}
          </p>
          <ul className={styles.anchorList}>
            {ANCHORS.map((item) => (
              <li key={item.id} className={styles.anchorItem}>
                <Link to={item.to} className={styles.anchorLink}>
                  <span className={styles.anchorTitle}>{t(item.titleKey)}</span>
                  <span className={styles.anchorText}>{t(item.textKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
