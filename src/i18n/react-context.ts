import { createContext } from 'react'
import type { LocaleCode } from './index'

export type I18nContextValue = {
  locale: LocaleCode
  setLocale: (locale: LocaleCode) => void
}

export const I18nContext = createContext<I18nContextValue | null>(null)
