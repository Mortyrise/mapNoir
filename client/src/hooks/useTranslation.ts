import { useCallback } from 'react'
import { translations, type Language } from '../i18n/translations'

export function useTranslation(language: Language) {
  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || translations.en[key] || key
    },
    [language]
  )

  return t
}
