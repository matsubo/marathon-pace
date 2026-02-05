export const MARATHON_DISTANCE_KM = 42.195
export const MARATHON_DISTANCE_MI = 26.2188

export const MIN_MINUTES = 120
export const MAX_MINUTES = 420

export const PRESETS = [
  { label: '2:30', minutes: 150 },
  { label: '3:00', minutes: 180 },
  { label: '3:30', minutes: 210 },
  { label: '4:00', minutes: 240 },
  { label: '4:30', minutes: 270 },
  { label: '5:00', minutes: 300 },
  { label: '6:00', minutes: 360 },
]

export const CHECKPOINTS_KM = [
  { distance: 5, label: '5 km' },
  { distance: 10, label: '10 km' },
  { distance: 15, label: '15 km' },
  { distance: 20, label: '20 km' },
  { distance: 21.0975, labelKey: 'half' },
  { distance: 25, label: '25 km' },
  { distance: 30, label: '30 km' },
  { distance: 35, label: '35 km' },
  { distance: 40, label: '40 km' },
  { distance: 42.195, labelKey: 'finish' },
]

export const CHECKPOINTS_MI = [
  { distance: 5, label: '5 mi' },
  { distance: 10, label: '10 mi' },
  { distance: 13.1, labelKey: 'half' },
  { distance: 15, label: '15 mi' },
  { distance: 20, label: '20 mi' },
  { distance: 26.2, labelKey: 'finish' },
]

export function formatTime(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '--:--:--'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.round(totalSeconds % 60)
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function formatPace(secondsPerUnit) {
  if (isNaN(secondsPerUnit) || secondsPerUnit < 0) return '--:--'
  const minutes = Math.floor(secondsPerUnit / 60)
  const seconds = Math.round(secondsPerUnit % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function parseTimeString(timeStr) {
  // Parse "3-30-00" or "3:30:00" format
  const parts = timeStr.replace(/-/g, ':').split(':')
  if (parts.length >= 2) {
    const hours = parseInt(parts[0]) || 0
    const minutes = parseInt(parts[1]) || 0
    const seconds = parseInt(parts[2]) || 0
    return hours * 60 + minutes + seconds / 60
  }
  return 240 // default 4 hours
}

export function timeToUrlParam(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}-${minutes.toString().padStart(2, '0')}-00`
}
