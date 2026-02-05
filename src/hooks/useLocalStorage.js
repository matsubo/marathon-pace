import { useState, useEffect } from 'react'

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage not available
    }
  }, [key, value])

  return [value, setValue]
}

function detectBrowserLanguage() {
  try {
    const browserLang = navigator.language || navigator.userLanguage || 'en'
    const langCode = browserLang.split('-')[0].toLowerCase()

    const supportedLangs = ['en', 'ja', 'zh', 'es', 'hi']
    if (supportedLangs.includes(langCode)) {
      return langCode
    }

    if (browserLang.toLowerCase().startsWith('zh')) {
      return 'zh'
    }

    return 'en'
  } catch {
    return 'en'
  }
}

export function useLanguage() {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('marathon-pace-lang')
      if (saved !== null) {
        return JSON.parse(saved)
      }
      return detectBrowserLanguage()
    } catch {
      return detectBrowserLanguage()
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('marathon-pace-lang', JSON.stringify(lang))
    } catch {
      // localStorage not available
    }
  }, [lang])

  return [lang, setLang]
}
