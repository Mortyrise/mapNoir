import { useState, useCallback } from 'react'
import type { Language } from '../i18n/translations'

const STORAGE_KEY = 'mapnoir-language'

function detectLanguage(): Language {
  // Check localStorage
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'es') return stored

  // Check browser language
  const browserLang = navigator.language.split('-')[0]
  if (browserLang === 'es') return 'es'

  return 'en'
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(detectLanguage)

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang)
    setLanguageState(lang)
  }, [])

  return { language, setLanguage }
}
