import { describe, it, expect } from 'vitest'
import { TRANSLATIONS, LANGUAGES } from './translations'
import type { LangCode, TranslationKey } from './translations'

describe('TRANSLATIONS', () => {
  const requiredKeys: TranslationKey[] = [
    'title',
    'subtitle',
    'targetFinishTime',
    'pace',
    'distance',
    'splitTime',
    'targetTime',
    'kilometers',
    'miles',
    'share',
    'generating',
    'print',
    'settingsSaved',
    'goodLuck',
    'shareYourPace',
    'downloadImage',
    'shareOnX',
    'facebook',
    'downloadTip',
    'half',
    'finish',
    'pacePerKm',
    'pacePerMile',
    'halfMarathon',
    'fullMarathon',
    'copyLink',
    'linkCopied',
  ]

  const langCodes: LangCode[] = ['en', 'ja', 'zh', 'es', 'hi']

  it('has all supported languages', () => {
    for (const code of langCodes) {
      expect(TRANSLATIONS[code]).toBeDefined()
    }
  })

  for (const code of langCodes) {
    it(`has all required keys for language: ${code}`, () => {
      for (const key of requiredKeys) {
        expect(TRANSLATIONS[code][key]).toBeDefined()
        expect(TRANSLATIONS[code][key].length).toBeGreaterThan(0)
      }
    })
  }
})

describe('LANGUAGES', () => {
  it('has entries for all supported languages', () => {
    expect(LANGUAGES).toHaveLength(5)
  })

  it('each language has code, label, and name', () => {
    for (const lang of LANGUAGES) {
      expect(lang.code).toBeTruthy()
      expect(lang.label).toBeTruthy()
      expect(lang.name).toBeTruthy()
    }
  })

  it('contains English as the first language', () => {
    expect(LANGUAGES[0].code).toBe('en')
  })
})
