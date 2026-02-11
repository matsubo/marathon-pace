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

describe('marathon pace calculations - kilometers', () => {
  it('calculates correct pace for 3:00:00 marathon', () => {
    const totalMinutes = 180
    const totalSeconds = totalMinutes * 60 // 10800 seconds
    const pacePerKm = totalSeconds / MARATHON_DISTANCE_KM
    expect(formatPace(pacePerKm)).toBe('4:16')
  })

  it('calculates correct pace for 3:30:00 marathon', () => {
    const totalMinutes = 210
    const totalSeconds = totalMinutes * 60 // 12600 seconds
    const pacePerKm = totalSeconds / MARATHON_DISTANCE_KM
    expect(formatPace(pacePerKm)).toBe('4:59')
  })

  it('calculates correct pace for 4:00:00 marathon', () => {
    const totalMinutes = 240
    const totalSeconds = totalMinutes * 60 // 14400 seconds
    const pacePerKm = totalSeconds / MARATHON_DISTANCE_KM
    expect(formatPace(pacePerKm)).toBe('5:41')
  })

  it('calculates correct pace for 5:00:00 marathon', () => {
    const totalMinutes = 300
    const totalSeconds = totalMinutes * 60 // 18000 seconds
    const pacePerKm = totalSeconds / MARATHON_DISTANCE_KM
    expect(formatPace(pacePerKm)).toBe('7:07')
  })

  it('calculates correct half marathon split for 3:30:00 marathon', () => {
    const totalMinutes = 210
    const totalSeconds = totalMinutes * 60
    const halfMarathonDistance = 21.0975
    const halfMarathonTime = (halfMarathonDistance / MARATHON_DISTANCE_KM) * totalSeconds
    expect(formatTime(halfMarathonTime)).toBe('1:45:00')
  })

  it('calculates correct 10km split for 4:00:00 marathon', () => {
    const totalMinutes = 240
    const totalSeconds = totalMinutes * 60
    const distance10km = 10
    const splitTime = (distance10km / MARATHON_DISTANCE_KM) * totalSeconds
    expect(formatTime(splitTime)).toBe('0:56:53')
  })

  it('calculates correct 5km split for 3:30:00 marathon', () => {
    const totalMinutes = 210
    const totalSeconds = totalMinutes * 60
    const distance5km = 5
    const splitTime = (distance5km / MARATHON_DISTANCE_KM) * totalSeconds
    expect(formatTime(splitTime)).toBe('0:24:53')
  })
})

describe('marathon pace calculations - miles', () => {
  it('calculates correct pace for 3:00:00 marathon', () => {
    const totalMinutes = 180
    const totalSeconds = totalMinutes * 60
    const pacePerMi = totalSeconds / MARATHON_DISTANCE_MI
    expect(formatPace(pacePerMi)).toBe('6:52')
  })

  it('calculates correct pace for 3:30:00 marathon', () => {
    const totalMinutes = 210
    const totalSeconds = totalMinutes * 60
    const pacePerMi = totalSeconds / MARATHON_DISTANCE_MI
    expect(formatPace(pacePerMi)).toBe('8:01')
  })

  it('calculates correct pace for 4:00:00 marathon', () => {
    const totalMinutes = 240
    const totalSeconds = totalMinutes * 60
    const pacePerMi = totalSeconds / MARATHON_DISTANCE_MI
    expect(formatPace(pacePerMi)).toBe('9:09')
  })

  it('calculates correct half marathon split for 3:30:00 marathon', () => {
    const totalMinutes = 210
    const totalSeconds = totalMinutes * 60
    const halfMarathonDistance = 13.1
    const halfMarathonTime = (halfMarathonDistance / MARATHON_DISTANCE_MI) * totalSeconds
    expect(formatTime(halfMarathonTime)).toBe('1:44:55')
  })
})

describe('split time accuracy', () => {
  it('verifies finish time equals input time', () => {
    const totalMinutes = 210
    const totalSeconds = totalMinutes * 60
    const finishTime = (MARATHON_DISTANCE_KM / MARATHON_DISTANCE_KM) * totalSeconds
    expect(formatTime(finishTime)).toBe('3:30:00')
  })

  it('verifies pace calculation consistency', () => {
    const totalMinutes = 180
    const totalSeconds = totalMinutes * 60
    const pacePerKm = totalSeconds / MARATHON_DISTANCE_KM
    const time1kmUsingPace = pacePerKm
    const time1kmUsingSplit = (1 / MARATHON_DISTANCE_KM) * totalSeconds
    // Should be equal within floating point precision
    expect(Math.abs(time1kmUsingPace - time1kmUsingSplit)).toBeLessThan(0.01)
  })

  it('verifies sum of 1km segments equals total time', () => {
    const totalMinutes = 240
    const totalSeconds = totalMinutes * 60
    const pacePerKm = totalSeconds / MARATHON_DISTANCE_KM
    const total = pacePerKm * MARATHON_DISTANCE_KM
    // Should equal total time within floating point precision
    expect(Math.abs(total - totalSeconds)).toBeLessThan(0.01)
  })
})

describe('preset times accuracy', () => {
  it('calculates correct pace for all preset times', () => {
    // Verify that each preset has a valid pace calculation
    for (const preset of PRESETS) {
      const totalSeconds = preset.minutes * 60
      const pacePerKm = totalSeconds / MARATHON_DISTANCE_KM
      const formattedPace = formatPace(pacePerKm)
      // Pace should be a valid time format
      expect(formattedPace).toMatch(/^\d+:\d{2}$/)
      // Pace should be reasonable (between 3:00 and 15:00 per km)
      const [mins, secs] = formattedPace.split(':').map(Number)
      const totalPaceSeconds = mins * 60 + secs
      expect(totalPaceSeconds).toBeGreaterThan(180) // faster than 3:00/km
      expect(totalPaceSeconds).toBeLessThan(900) // slower than 15:00/km
    }
  })
})

describe('checkpoint distances integrity', () => {
  it('verifies km checkpoints are in ascending order', () => {
    for (let i = 1; i < CHECKPOINTS_KM.length; i++) {
      expect(CHECKPOINTS_KM[i].distance).toBeGreaterThan(CHECKPOINTS_KM[i - 1].distance)
    }
  })

  it('verifies mi checkpoints are in ascending order', () => {
    for (let i = 1; i < CHECKPOINTS_MI.length; i++) {
      expect(CHECKPOINTS_MI[i].distance).toBeGreaterThan(CHECKPOINTS_MI[i - 1].distance)
    }
  })

  it('verifies last km checkpoint is marathon distance', () => {
    const lastCheckpoint = CHECKPOINTS_KM[CHECKPOINTS_KM.length - 1]
    expect(lastCheckpoint.distance).toBe(MARATHON_DISTANCE_KM)
    expect(lastCheckpoint.labelKey).toBe('finish')
  })

  it('verifies last mi checkpoint is marathon distance', () => {
    const lastCheckpoint = CHECKPOINTS_MI[CHECKPOINTS_MI.length - 1]
    expect(lastCheckpoint.distance).toBe(26.2)
    expect(lastCheckpoint.labelKey).toBe('finish')
  })
})
