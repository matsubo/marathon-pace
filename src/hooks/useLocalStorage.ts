import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import type { LangCode } from '../utils/translations'

const SUPPORTED_LANGS: LangCode[] = ['en', 'ja', 'zh', 'es', 'hi']

export function useLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? (JSON.parse(saved) as T) : defaultValue
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

function detectBrowserLanguage(): LangCode {
  try {
    const browserLang = navigator.language || 'en'
    const langCode = browserLang.split('-')[0].toLowerCase()

    if (SUPPORTED_LANGS.includes(langCode as LangCode)) {
      return langCode as LangCode
    }

    if (browserLang.toLowerCase().startsWith('zh')) {
      return 'zh'
    }

    return 'en'
  } catch {
    return 'en'
  }
}

export function useLanguage(): [LangCode, Dispatch<SetStateAction<LangCode>>] {
  const [lang, setLang] = useState<LangCode>(() => {
    try {
      const saved = localStorage.getItem('marathon-pace-lang')
      if (saved !== null) {
        return JSON.parse(saved) as LangCode
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
