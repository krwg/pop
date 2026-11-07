import { en } from './locales/en'
import { ru } from './locales/ru'
import type { LocaleCode, MessageKey, MessageTree } from './locales/types'

export type { LocaleCode, MessageKey, MessageTree }

export const DEFAULT_LOCALE: LocaleCode = 'ru'

export const messages: Record<LocaleCode, MessageTree> = {
  ru,
  en,
}

function readPath(tree: MessageTree, key: MessageKey): string {
  const parts = key.split('.')
  let current: unknown = tree

  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return key
    }
    current = (current as Record<string, unknown>)[part]
  }

  return typeof current === 'string' ? current : key
}

export function translate(
  locale: LocaleCode,
  key: MessageKey,
  fallbackLocale: LocaleCode = DEFAULT_LOCALE,
): string {
  const primary = readPath(messages[locale], key)
  if (primary !== key) return primary
  if (locale === fallbackLocale) return key
  return readPath(messages[fallbackLocale], key)
}
