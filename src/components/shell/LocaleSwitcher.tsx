import { useI18n, useT } from '@/i18n/hooks'
import type { LocaleCode } from '@/i18n'
import styles from './LocaleSwitcher.module.css'

const LOCALES: LocaleCode[] = ['ru', 'en']

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n()
  const t = useT()

  return (
    <div className={styles.switcher} role="group" aria-label={t('lang.switcher')}>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={[styles.option, locale === code ? styles.active : '']
            .filter(Boolean)
            .join(' ')}
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
        >
          {t(code === 'ru' ? 'lang.ru' : 'lang.en')}
        </button>
      ))}
    </div>
  )
}
