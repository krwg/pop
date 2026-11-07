import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_LOCALE, type LocaleCode } from './index'
import { I18nContext } from './react-context'

const LOCALE_STORAGE_KEY = 'pop:locale'

function readStoredLocale(): LocaleCode {
  try {
    const value = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (value === 'ru' || value === 'en') return value
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE
}

type I18nProviderProps = {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<LocaleCode>(readStoredLocale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: LocaleCode) => {
    setLocaleState(next)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
