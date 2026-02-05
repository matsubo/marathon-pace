import { useState, useMemo, useCallback, useEffect, type ChangeEvent, type MouseEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocalStorage, useLanguage } from './hooks/useLocalStorage'
import { TRANSLATIONS, LANGUAGES } from './utils/translations'
import type { TranslationKey } from './utils/translations'
import {
  MARATHON_DISTANCE_KM,
  MARATHON_DISTANCE_MI,
  MIN_MINUTES,
  MAX_MINUTES,
  PRESETS,
  CHECKPOINTS_KM,
  CHECKPOINTS_MI,
  formatTime,
  formatPace,
  parseTimeString,
  timeToUrlParam,
} from './utils/constants'
import {
  XIcon,
  FacebookIcon,
  DownloadIcon,
  ShareIcon,
  SunIcon,
  MoonIcon,
  GlobeIcon,
  PrintIcon,
  LinkIcon,
  CheckIcon,
} from './components/Icons'

interface Theme {
  bg: string
  card: string
  cardBorder: string
  text: string
  textMuted: string
  textSubtle: string
  title: string
  accent: string
  tableHeader: string
  tableHeaderText: string
  tableRowAlt: string
  tableRowAlt2: string
  tableHighlight: string
  tableBorder: string
  presetActive: string
  presetInactive: string
  unitActive: string
  unitInactive: string
  sliderTrack: string
}

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const timeParam = searchParams.get('target_time')

  // Parse URL parameter if present
  const initialMinutes = timeParam ? parseTimeString(timeParam) : null

  // Persisted state
  const [storedMinutes, setStoredMinutes] = useLocalStorage('marathon-pace-minutes', 240)
  const [unit, setUnit] = useLocalStorage<'km' | 'mi'>('marathon-pace-unit', 'km')
  const [darkMode, setDarkMode] = useLocalStorage('marathon-pace-dark', false)
  const [lang, setLang] = useLanguage()

  // Use URL param if available, otherwise use stored value
  const totalMinutes = initialMinutes ?? storedMinutes
  const setTotalMinutes = (value: number) => {
    setStoredMinutes(value)
    // Update URL when user changes time
    setSearchParams({ target_time: timeToUrlParam(value) }, { replace: true })
  }

  // UI state
  const [showShareModal, setShowShareModal] = useState(false)
  const [showLangModal, setShowLangModal] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const t = useCallback(
    (key: TranslationKey) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key,
    [lang]
  )

  const totalFinishSeconds = totalMinutes * 60

  const pacePerKm = useMemo(
    () => totalFinishSeconds / MARATHON_DISTANCE_KM,
    [totalFinishSeconds]
  )
  const pacePerMi = useMemo(
    () => totalFinishSeconds / MARATHON_DISTANCE_MI,
    [totalFinishSeconds]
  )

  const splits = useMemo(() => {
    const checkpoints = unit === 'km' ? CHECKPOINTS_KM : CHECKPOINTS_MI
    const marathonDistance = unit === 'km' ? MARATHON_DISTANCE_KM : MARATHON_DISTANCE_MI
    return checkpoints.map((cp) => ({
      label: cp.labelKey ? t(cp.labelKey as TranslationKey) : cp.label!,
      isFinish: cp.labelKey === 'finish',
      isHalf: cp.labelKey === 'half',
      splitTime: formatTime((cp.distance / marathonDistance) * totalFinishSeconds),
    }))
  }, [unit, totalFinishSeconds, t])

  const sliderPercent =
    ((totalMinutes - MIN_MINUTES) / (MAX_MINUTES - MIN_MINUTES)) * 100

  // Generate shareable URL
  const shareableUrl = useMemo(() => {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
    return `${window.location.origin}${basePath}?target_time=${timeToUrlParam(totalMinutes)}`
  }, [totalMinutes])

  // Update document title and OGP meta tags
  useEffect(() => {
    const timeStr = formatTime(totalMinutes * 60)
    const paceStr = unit === 'km'
      ? `${formatPace(pacePerKm)}/km`
      : `${formatPace(pacePerMi)}/mi`
    const title = `${timeStr} - ${t('title')}`
    const description = `${t('targetTime')}: ${timeStr} | ${t('pace')}: ${paceStr}`

    document.title = title

    const updateMeta = (attr: string, key: string, content: string) => {
      const el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
      if (el) el.content = content
    }

    updateMeta('property', 'og:title', title)
    updateMeta('property', 'og:description', description)
    updateMeta('property', 'og:url', shareableUrl)
    updateMeta('name', 'twitter:title', title)
    updateMeta('name', 'twitter:description', description)
  }, [totalMinutes, unit, pacePerKm, pacePerMi, t, shareableUrl])


  // Copy link to clipboard
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = shareableUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }, [shareableUrl])

  // Generate pace card image
  const generatePaceCardImage = useCallback(() => {
    setIsGenerating(true)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 1200
    canvas.height = 630

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#4f46e5')
    gradient.addColorStop(1, '#7c3aed')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 100 + 50,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }

    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.roundRect(60, 60, canvas.width - 120, canvas.height - 120, 24)
    ctx.fill()

    ctx.fillStyle = '#1e1b4b'
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`🏃 ${t('title')}`, canvas.width / 2, 140)

    ctx.fillStyle = '#4f46e5'
    ctx.font = 'bold 120px system-ui, -apple-system, sans-serif'
    ctx.fillText(formatTime(totalFinishSeconds), canvas.width / 2, 280)

    ctx.fillStyle = '#6b7280'
    ctx.font = '28px system-ui, -apple-system, sans-serif'
    ctx.fillText(t('targetFinishTime'), canvas.width / 2, 330)

    const boxY = 380,
      boxW = 320,
      boxX = (canvas.width - boxW) / 2
    ctx.fillStyle = '#f3f4f6'
    ctx.beginPath()
    ctx.roundRect(boxX, boxY, boxW, 100, 16)
    ctx.fill()

    ctx.fillStyle = '#374151'
    ctx.font = '24px system-ui, -apple-system, sans-serif'
    ctx.fillText(
      unit === 'km' ? t('pacePerKm') : t('pacePerMile'),
      canvas.width / 2,
      boxY + 35
    )

    ctx.fillStyle = '#4f46e5'
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    const paceText =
      unit === 'km'
        ? formatPace(pacePerKm) + ' /km'
        : formatPace(pacePerMi) + ' /mi'
    ctx.fillText(paceText, canvas.width / 2, boxY + 78)

    ctx.fillStyle = '#9ca3af'
    ctx.font = '22px system-ui, -apple-system, sans-serif'
    const halfTime = formatTime(
      (21.0975 / MARATHON_DISTANCE_KM) * totalFinishSeconds
    )
    ctx.fillText(
      `${t('halfMarathon')}: ${halfTime}  •  ${t('fullMarathon')}: ${formatTime(totalFinishSeconds)}`,
      canvas.width / 2,
      530
    )

    ctx.fillStyle = '#d1d5db'
    ctx.font = '20px system-ui, -apple-system, sans-serif'
    ctx.fillText(
      `${t('title')} • ${unit === 'km' ? '42.195 km' : '26.2 mi'}`,
      canvas.width / 2,
      575
    )

    setGeneratedImage(canvas.toDataURL('image/png'))
    setIsGenerating(false)
    setShowShareModal(true)
  }, [totalFinishSeconds, pacePerKm, pacePerMi, unit, t])

  const downloadImage = useCallback(() => {
    if (!generatedImage) return
    const link = document.createElement('a')
    link.download = `marathon-pace-${formatTime(totalFinishSeconds).replace(/:/g, '-')}.png`
    link.href = generatedImage
    link.click()
  }, [generatedImage, totalFinishSeconds])

  const shareToX = useCallback(() => {
    const paceText =
      unit === 'km'
        ? `${formatPace(pacePerKm)}/km`
        : `${formatPace(pacePerMi)}/mi`
    const text = `🏃 My marathon target: ${formatTime(totalFinishSeconds)}\n⏱️ Pace: ${paceText}\n\n#Marathon #Running #MarathonTraining`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableUrl)}`,
      '_blank'
    )
  }, [totalFinishSeconds, pacePerKm, pacePerMi, unit, shareableUrl])

  const shareToFacebook = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`,
      '_blank'
    )
  }, [shareableUrl])

  const theme: Theme = {
    bg: darkMode
      ? 'bg-gray-900'
      : 'bg-gradient-to-br from-blue-50 to-indigo-100',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    cardBorder: darkMode ? 'border border-gray-700' : '',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-600',
    textSubtle: darkMode ? 'text-gray-500' : 'text-gray-400',
    title: darkMode ? 'text-indigo-400' : 'text-indigo-900',
    accent: darkMode ? 'text-indigo-400' : 'text-indigo-600',
    tableHeader: darkMode ? 'bg-gray-700' : 'bg-indigo-50',
    tableHeaderText: darkMode ? 'text-indigo-300' : 'text-indigo-900',
    tableRowAlt: darkMode ? 'bg-gray-800' : 'bg-white',
    tableRowAlt2: darkMode ? 'bg-gray-750' : 'bg-gray-50',
    tableHighlight: darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50',
    tableBorder: darkMode ? 'border-gray-700' : 'border-gray-100',
    presetActive: 'bg-indigo-600 text-white shadow-md',
    presetInactive: darkMode
      ? 'bg-gray-700 text-indigo-300 hover:bg-gray-600'
      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    unitActive: 'bg-indigo-600 text-white shadow-md',
    unitInactive: darkMode
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    sliderTrack: darkMode ? '#374151' : '#e5e7eb',
  }

  return (
    <div
      className={`min-h-screen ${theme.bg} p-4 print:bg-white print:p-2 transition-colors duration-300`}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 print:mb-4">
          <button
            onClick={() => setShowLangModal(true)}
            className={`p-2 rounded-lg ${theme.card} ${theme.cardBorder} shadow-md no-print transition-colors ${theme.text} flex items-center gap-1`}
          >
            <GlobeIcon />
            <span className="text-xs font-medium">
              {LANGUAGES.find((l) => l.code === lang)?.label}
            </span>
          </button>

          <div className="flex-1 text-center px-2">
            <h1
              className={`text-2xl sm:text-3xl font-bold ${theme.title} print:text-2xl print:text-black`}
            >
              🏃 {t('title')}
            </h1>
            <p className={`${theme.textMuted} mt-1 no-print text-sm`}>
              {t('subtitle')}
            </p>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${theme.card} ${theme.cardBorder} shadow-md no-print transition-colors ${theme.text}`}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Input Section */}
        <div
          className={`${theme.card} ${theme.cardBorder} rounded-xl shadow-lg p-6 mb-6 no-print transition-colors`}
        >
          <div className="text-center mb-6">
            <div
              className={`text-6xl font-bold font-mono ${theme.accent} tracking-tight`}
            >
              {formatTime(totalFinishSeconds)}
            </div>
            <div className={`${theme.textMuted} mt-1`}>
              {t('targetFinishTime')}
            </div>
          </div>

          <div className="mb-6 px-2">
            <input
              type="range"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              value={totalMinutes}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTotalMinutes(parseInt(e.target.value))}
              className="time-slider"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${sliderPercent}%, ${theme.sliderTrack} ${sliderPercent}%, ${theme.sliderTrack} 100%)`,
              }}
            />
            <div
              className={`flex justify-between text-sm ${theme.textSubtle} mt-2 px-1`}
            >
              <span>2:00</span>
              <span>3:30</span>
              <span>5:00</span>
              <span>7:00</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setTotalMinutes(preset.minutes)}
                className={`px-4 py-2 text-sm rounded-full font-medium transition-all ${
                  totalMinutes === preset.minutes
                    ? theme.presetActive
                    : theme.presetInactive
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => setUnit('km')}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                unit === 'km' ? theme.unitActive : theme.unitInactive
              }`}
            >
              {t('kilometers')}
            </button>
            <button
              onClick={() => setUnit('mi')}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                unit === 'mi' ? theme.unitActive : theme.unitInactive
              }`}
            >
              {t('miles')}
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-indigo-600 text-white rounded-xl shadow-lg p-4 mb-6 print:bg-gray-800 print:rounded-none print:mb-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-indigo-200 text-sm print:text-gray-300">
                {t('targetTime')}
              </div>
              <div className="text-2xl font-bold font-mono print:text-xl">
                {formatTime(totalFinishSeconds)}
              </div>
            </div>
            <div>
              <div className="text-indigo-200 text-sm print:text-gray-300">
                {t('pace')}/{unit === 'km' ? 'km' : 'mi'}
              </div>
              <div className="text-2xl font-bold font-mono print:text-xl">
                {unit === 'km' ? formatPace(pacePerKm) : formatPace(pacePerMi)}
              </div>
            </div>
          </div>
        </div>

        {/* Pace Table */}
        <div
          className={`${theme.card} ${theme.cardBorder} rounded-xl shadow-lg overflow-hidden mb-6 pace-table print:shadow-none print:border print:border-gray-300 transition-colors`}
        >
          <table className="w-full print-compact">
            <thead>
              <tr className={`${theme.tableHeader} print:bg-gray-100`}>
                <th
                  className={`px-4 py-3 text-left ${theme.tableHeaderText} font-semibold print:text-black print:py-2`}
                >
                  {t('distance')}
                </th>
                <th
                  className={`px-4 py-3 text-right ${theme.tableHeaderText} font-semibold print:text-black print:py-2`}
                >
                  {t('splitTime')}
                </th>
              </tr>
            </thead>
            <tbody>
              {splits.map((split, index) => (
                <tr
                  key={split.label}
                  className={`border-t ${theme.tableBorder} ${
                    split.isHalf || split.isFinish
                      ? `${theme.tableHighlight} font-semibold print:bg-gray-50`
                      : index % 2 === 0
                        ? theme.tableRowAlt
                        : theme.tableRowAlt2
                  } transition-colors`}
                >
                  <td
                    className={`px-4 py-3 print:py-2 ${theme.text} print:text-black`}
                  >
                    <span
                      className={
                        split.isFinish ? `${theme.accent} print:text-black` : ''
                      }
                    >
                      {split.isFinish ? '🏁 ' : ''}
                      {split.label}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono text-lg ${theme.text} print:py-2 print:text-base print:text-black`}
                  >
                    {split.splitTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 no-print">
          <button
            onClick={generatePaceCardImage}
            disabled={isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <ShareIcon />
            {isGenerating ? t('generating') : t('share')}
          </button>

          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg flex items-center gap-2"
          >
            <PrintIcon />
            {t('print')}
          </button>
        </div>

        <p className={`text-center ${theme.textSubtle} text-sm mt-3 no-print`}>
          {t('settingsSaved')}
        </p>

        {/* Print-only footer */}
        <div className="print-only text-center text-gray-500 text-sm mt-4 border-t pt-2">
          {t('title')} • {unit === 'km' ? '42.195 km' : '26.2 mi'} •{' '}
          {t('targetTime')}: {formatTime(totalFinishSeconds)}
        </div>

        {/* Footer */}
        <div className={`text-center ${theme.textSubtle} text-sm mt-8 no-print`}>
          <p>{t('goodLuck')} 🏆</p>
          <p className="mt-2">
            <a href="https://x.com/matsubokkuri" target="_blank" rel="noopener noreferrer" className="hover:underline">@matsubokkuri</a>
            {' • '}
            <a href="https://github.com/matsubo/marathon-pace" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          </p>
        </div>
      </div>

      {/* Language Modal */}
      {showLangModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-overlay no-print"
          onClick={() => setShowLangModal(false)}
        >
          <div
            className={`${theme.card} rounded-2xl max-w-sm w-full p-6 modal-content`}
            onClick={(e: MouseEvent) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${theme.text}`}>🌐 Language</h3>
              <button
                onClick={() => setShowLangModal(false)}
                className={`${theme.textMuted} text-2xl leading-none`}
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              {LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    setLang(language.code)
                    setShowLangModal(false)
                  }}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-between ${
                    lang === language.code
                      ? 'bg-indigo-600 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <span>{language.name}</span>
                  <span className="text-sm opacity-70">{language.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-overlay no-print"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className={`${theme.card} rounded-2xl max-w-lg w-full p-6 modal-content`}
            onClick={(e: MouseEvent) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${theme.text}`}>
                {t('shareYourPace')}
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className={`${theme.textMuted} text-2xl leading-none`}
              >
                ×
              </button>
            </div>

            {generatedImage && (
              <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                <img src={generatedImage} alt="Pace Card" className="w-full" />
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={downloadImage}
                className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} rounded-xl font-medium transition-colors flex items-center justify-center gap-2`}
              >
                <DownloadIcon />
                {t('downloadImage')}
              </button>

              <button
                onClick={copyLink}
                className={`w-full px-4 py-3 ${linkCopied ? 'bg-green-600 text-white' : darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} rounded-xl font-medium transition-colors flex items-center justify-center gap-2`}
              >
                {linkCopied ? <CheckIcon /> : <LinkIcon />}
                {linkCopied ? t('linkCopied') : t('copyLink')}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={shareToX}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <XIcon />
                  {t('shareOnX')}
                </button>

                <button
                  onClick={shareToFacebook}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FacebookIcon />
                  {t('facebook')}
                </button>
              </div>
            </div>

            <p className={`text-center ${theme.textMuted} text-sm mt-4`}>
              {t('downloadTip')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
