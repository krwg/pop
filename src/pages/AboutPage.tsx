import { AboutLightBg } from '@/components/about/AboutLightBg'
import { PageFrame } from '@/components/shell/PageFrame'
import { useT } from '@/i18n/hooks'
import styles from './AboutPage.module.css'

export function AboutPage() {
  const t = useT()

  return (
    <div className={styles.scene}>
      <AboutLightBg />

      <PageFrame className={styles.frame}>
        <article className={styles.page} aria-labelledby="about-title">
          <header className={styles.header}>
            <p className={styles.brand}>PILLARS OF PIXELS</p>
            <h1 id="about-title" className={styles.title}>
              {t('pages.about.title')}
            </h1>
          </header>

          <div className={styles.body}>
            <p className={styles.paragraph}>{t('pages.about.p1')}</p>
            <p className={styles.paragraph}>{t('pages.about.p2')}</p>
            <p className={styles.paragraph}>{t('pages.about.p3')}</p>
            <p className={styles.paragraph}>{t('pages.about.p4')}</p>
            <p className={styles.paragraph}>{t('pages.about.p5')}</p>
          </div>
        </article>
      </PageFrame>
    </div>
  )
}
