import { describe, it, expect } from 'vitest'
import {
  formatTime,
  formatPace,
  parseTimeString,
  timeToUrlParam,
  MARATHON_DISTANCE_KM,
  MARATHON_DISTANCE_MI,
  MIN_MINUTES,
  MAX_MINUTES,
  PRESETS,
  CHECKPOINTS_KM,
  CHECKPOINTS_MI,
} from './constants'

describe('formatTime', () => {
  it('formats 4 hours correctly', () => {
    expect(formatTime(4 * 3600)).toBe('4:00:00')
  })

  it('formats 3 hours 30 minutes correctly', () => {
    expect(formatTime(3 * 3600 + 30 * 60)).toBe('3:30:00')
  })

  it('formats time with seconds correctly', () => {
    expect(formatTime(3 * 3600 + 30 * 60 + 45)).toBe('3:30:45')
  })

  it('pads minutes and seconds with zeros', () => {
    expect(formatTime(3600 + 5 * 60 + 3)).toBe('1:05:03')
  })

  it('returns placeholder for NaN', () => {
    expect(formatTime(NaN)).toBe('--:--:--')
  })

  it('returns placeholder for negative values', () => {
    expect(formatTime(-100)).toBe('--:--:--')
  })

  it('handles zero seconds', () => {
    expect(formatTime(0)).toBe('0:00:00')
  })
})

describe('formatPace', () => {
  it('formats pace correctly', () => {
    // 5:41 per km for a 4-hour marathon
    const paceSeconds = (4 * 3600) / MARATHON_DISTANCE_KM
    const result = formatPace(paceSeconds)
    expect(result).toBe('5:41')
  })

  it('returns placeholder for NaN', () => {
    expect(formatPace(NaN)).toBe('--:--')
  })

  it('returns placeholder for negative values', () => {
    expect(formatPace(-1)).toBe('--:--')
  })

  it('pads seconds with zeros', () => {
    expect(formatPace(300)).toBe('5:00')
  })
})

describe('parseTimeString', () => {
  it('parses dash-separated format', () => {
    expect(parseTimeString('3-30-00')).toBe(210)
  })

  it('parses colon-separated format', () => {
    expect(parseTimeString('3:30:00')).toBe(210)
  })

  it('parses 4-hour time', () => {
    expect(parseTimeString('4-00-00')).toBe(240)
  })

  it('handles time with seconds', () => {
    const result = parseTimeString('3-30-30')
    expect(result).toBe(210.5)
  })

  it('returns default 240 for invalid input', () => {
    expect(parseTimeString('x')).toBe(240)
  })

  it('parses time without seconds', () => {
    expect(parseTimeString('3-30')).toBe(210)
  })
})

describe('timeToUrlParam', () => {
  it('converts 240 minutes to URL param', () => {
    expect(timeToUrlParam(240)).toBe('4-00-00')
  })

  it('converts 210 minutes to URL param', () => {
    expect(timeToUrlParam(210)).toBe('3-30-00')
  })

  it('converts 150 minutes to URL param', () => {
    expect(timeToUrlParam(150)).toBe('2-30-00')
  })

  it('pads minutes with zeros', () => {
    expect(timeToUrlParam(125)).toBe('2-05-00')
  })
})

describe('constants', () => {
  it('has correct marathon distance in km', () => {
    expect(MARATHON_DISTANCE_KM).toBe(42.195)
  })

  it('has correct marathon distance in miles', () => {
    expect(MARATHON_DISTANCE_MI).toBe(26.2188)
  })

  it('has correct min/max minutes', () => {
    expect(MIN_MINUTES).toBe(120)
    expect(MAX_MINUTES).toBe(420)
  })

  it('has preset times within valid range', () => {
    for (const preset of PRESETS) {
      expect(preset.minutes).toBeGreaterThanOrEqual(MIN_MINUTES)
      expect(preset.minutes).toBeLessThanOrEqual(MAX_MINUTES)
    }
  })

  it('has 4:00 as a preset (default target time)', () => {
    const fourHourPreset = PRESETS.find((p) => p.minutes === 240)
    expect(fourHourPreset).toBeDefined()
    expect(fourHourPreset!.label).toBe('4:00')
  })

  it('has finish checkpoint in km checkpoints', () => {
    const finish = CHECKPOINTS_KM.find((cp) => cp.labelKey === 'finish')
    expect(finish).toBeDefined()
    expect(finish!.distance).toBe(42.195)
  })

  it('has finish checkpoint in mi checkpoints', () => {
    const finish = CHECKPOINTS_MI.find((cp) => cp.labelKey === 'finish')
    expect(finish).toBeDefined()
    expect(finish!.distance).toBe(26.2)
  })

  it('has half checkpoint in both checkpoint sets', () => {
    const halfKm = CHECKPOINTS_KM.find((cp) => cp.labelKey === 'half')
    const halfMi = CHECKPOINTS_MI.find((cp) => cp.labelKey === 'half')
    expect(halfKm).toBeDefined()
    expect(halfMi).toBeDefined()
  })
})
