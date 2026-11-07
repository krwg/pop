import { useCallback, useContext } from 'react'
import { translate, type MessageKey } from './index'
import { I18nContext } from './react-context'

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}

export function useT() {
  const { locale } = useI18n()
  return useCallback((key: MessageKey) => translate(locale, key), [locale])
}
