import type { Language } from '../i18n/translations'

interface LanguageSelectorProps {
  language: Language
  onChange: (lang: Language) => void
}

export function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
  return (
    <div className="language-selector">
      <button
        className={`lang-btn ${language === 'en' ? 'lang-btn-active' : ''}`}
        onClick={() => onChange('en')}
        aria-label="English"
      >
        EN
      </button>
      <button
        className={`lang-btn ${language === 'es' ? 'lang-btn-active' : ''}`}
        onClick={() => onChange('es')}
        aria-label="Español"
      >
        ES
      </button>
    </div>
  )
}
