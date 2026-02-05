import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage, useLanguage } from './useLocalStorage'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('useLocalStorage', () => {
  it('returns the default value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 42))
    expect(result.current[0]).toBe(42)
  })

  it('returns stored value when it exists', () => {
    localStorage.setItem('test-key', JSON.stringify(100))
    const { result } = renderHook(() => useLocalStorage('test-key', 42))
    expect(result.current[0]).toBe(100)
  })

  it('updates value and persists to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 42))
    act(() => {
      result.current[1](99)
    })
    expect(result.current[0]).toBe(99)
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe(99)
  })

  it('handles string values', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
    act(() => {
      result.current[1]('updated')
    })
    expect(result.current[0]).toBe('updated')
  })

  it('handles boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', false))
    expect(result.current[0]).toBe(false)
    act(() => {
      result.current[1](true)
    })
    expect(result.current[0]).toBe(true)
  })

  it('uses default value when localStorage has invalid JSON', () => {
    localStorage.setItem('test-key', 'not-valid-json')
    const { result } = renderHook(() => useLocalStorage('test-key', 42))
    expect(result.current[0]).toBe(42)
  })
})

describe('useLanguage', () => {
  it('returns a language code', () => {
    const { result } = renderHook(() => useLanguage())
    expect(['en', 'ja', 'zh', 'es', 'hi']).toContain(result.current[0])
  })

  it('returns stored language when it exists', () => {
    localStorage.setItem('marathon-pace-lang', JSON.stringify('ja'))
    const { result } = renderHook(() => useLanguage())
    expect(result.current[0]).toBe('ja')
  })

  it('updates language and persists to localStorage', () => {
    const { result } = renderHook(() => useLanguage())
    act(() => {
      result.current[1]('es')
    })
    expect(result.current[0]).toBe('es')
    expect(JSON.parse(localStorage.getItem('marathon-pace-lang')!)).toBe('es')
  })

  it('defaults to en when browser language is not supported', () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('fr-FR')
    const { result } = renderHook(() => useLanguage())
    expect(result.current[0]).toBe('en')
  })

  it('detects Japanese browser language', () => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('ja-JP')
    const { result } = renderHook(() => useLanguage())
    expect(result.current[0]).toBe('ja')
  })
})
