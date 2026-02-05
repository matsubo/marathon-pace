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
  accent: string
  accentHover: string
  summaryBg: string
  summaryText: string
  summaryMuted: string
  tableHeader: string
  tableHeaderText: string
  tableRowAlt: string
  tableRowAlt2: string
  tableHighlightBg: string
  tableBorder: string
  presetActive: string
  presetInactive: string
  unitActive: string
  unitInactive: string
  sliderTrack: string
  sliderFill: string
  modalBtnPrimary: string
  modalBtn: string
}

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const timeParam = searchParams.get('target_time')

  const initialMinutes = timeParam ? parseTimeString(timeParam) : null

  const [storedMinutes, setStoredMinutes] = useLocalStorage('marathon-pace-minutes', 240)
  const [unit, setUnit] = useLocalStorage<'km' | 'mi'>('marathon-pace-unit', 'km')
  const [darkMode, setDarkMode] = useLocalStorage('marathon-pace-dark', false)
  const [lang, setLang] = useLanguage()

  const totalMinutes = initialMinutes ?? storedMinutes
  const setTotalMinutes = (value: number) => {
    setStoredMinutes(value)
    setSearchParams({ target_time: timeToUrlParam(value) }, { replace: true })
  }

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

  const shareableUrl = useMemo(() => {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
    return `${window.location.origin}${basePath}?target_time=${timeToUrlParam(totalMinutes)}`
  }, [totalMinutes])

  // Toggle dark class on <html> for CSS-based dark styles (slider, row-highlight)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

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

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
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

  const generatePaceCardImage = useCallback(() => {
    setIsGenerating(true)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 1200
    canvas.height = 630

    // Track-inspired gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#D94F30')
    gradient.addColorStop(1, '#A93B24')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Diagonal track lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.lineWidth = 1
    for (let i = -canvas.height; i < canvas.width + canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i - canvas.height, canvas.height)
      ctx.stroke()
    }

    // White card
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.roundRect(60, 60, canvas.width - 120, canvas.height - 120, 20)
    ctx.fill()

    // Title
    ctx.fillStyle = '#1C1917'
    ctx.font = '600 36px "DM Sans", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${t('title')}`, canvas.width / 2, 135)

    // Big time
    ctx.fillStyle = '#D94F30'
    ctx.font = '110px "Bebas Neue", sans-serif'
    ctx.fillText(formatTime(totalFinishSeconds), canvas.width / 2, 270)

    // Subtitle
    ctx.fillStyle = '#78716C'
    ctx.font = '400 24px "DM Sans", system-ui, sans-serif'
    ctx.fillText(t('targetFinishTime'), canvas.width / 2, 310)

    // Pace box
    const boxY = 350, boxW = 300, boxX = (canvas.width - boxW) / 2
    ctx.fillStyle = '#FEF2EF'
    ctx.beginPath()
    ctx.roundRect(boxX, boxY, boxW, 90, 12)
    ctx.fill()

    ctx.fillStyle = '#78716C'
    ctx.font = '400 20px "DM Sans", system-ui, sans-serif'
    ctx.fillText(
      unit === 'km' ? t('pacePerKm') : t('pacePerMile'),
      canvas.width / 2,
      boxY + 32
    )

    ctx.fillStyle = '#D94F30'
    ctx.font = '52px "Bebas Neue", sans-serif'
    const paceText = unit === 'km'
      ? formatPace(pacePerKm) + ' /km'
      : formatPace(pacePerMi) + ' /mi'
    ctx.fillText(paceText, canvas.width / 2, boxY + 75)

    // Bottom stats
    ctx.fillStyle = '#A8A29E'
    ctx.font = '400 20px "DM Sans", system-ui, sans-serif'
    const halfTime = formatTime(
      (21.0975 / MARATHON_DISTANCE_KM) * totalFinishSeconds
    )
    ctx.fillText(
      `${t('halfMarathon')}: ${halfTime}  |  ${t('fullMarathon')}: ${formatTime(totalFinishSeconds)}`,
      canvas.width / 2,
      520
    )

    ctx.fillStyle = '#D6D3D1'
    ctx.font = '400 18px "DM Sans", system-ui, sans-serif'
    ctx.fillText(
      `${t('title')}  ·  ${unit === 'km' ? '42.195 km' : '26.2 mi'}`,
      canvas.width / 2,
      560
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
    const paceText = unit === 'km'
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

  const theme: Theme = darkMode ? {
    bg: 'bg-surface-dark',
    card: 'bg-surface-dark-card',
    cardBorder: 'border border-white/5',
    text: 'text-stone-100',
    textMuted: 'text-stone-400',
    textSubtle: 'text-stone-500',
    accent: 'text-track-400',
    accentHover: 'hover:text-track-300',
    summaryBg: 'bg-surface-dark-card-alt border border-white/5',
    summaryText: 'text-stone-100',
    summaryMuted: 'text-stone-400',
    tableHeader: 'bg-surface-dark-card-alt',
    tableHeaderText: 'text-stone-300',
    tableRowAlt: 'bg-surface-dark-card',
    tableRowAlt2: 'bg-surface-dark-card-alt/50',
    tableHighlightBg: 'bg-track-900/30',
    tableBorder: 'border-white/5',
    presetActive: 'bg-track-500 text-white shadow-lg shadow-track-500/20',
    presetInactive: 'bg-white/5 text-stone-300 hover:bg-white/10',
    unitActive: 'bg-track-500 text-white',
    unitInactive: 'bg-white/5 text-stone-400 hover:bg-white/10',
    sliderTrack: '#2A2D37',
    sliderFill: '#E8613D',
    modalBtnPrimary: 'bg-track-500 text-white hover:bg-track-600',
    modalBtn: 'bg-white/5 text-stone-200 hover:bg-white/10',
  } : {
    bg: 'bg-surface-light',
    card: 'bg-white',
    cardBorder: 'border border-stone-200/60',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    textSubtle: 'text-stone-400',
    accent: 'text-track-500',
    accentHover: 'hover:text-track-600',
    summaryBg: 'bg-stone-900',
    summaryText: 'text-white',
    summaryMuted: 'text-stone-400',
    tableHeader: 'bg-stone-50',
    tableHeaderText: 'text-stone-500',
    tableRowAlt: 'bg-white',
    tableRowAlt2: 'bg-stone-50/50',
    tableHighlightBg: 'bg-track-50',
    tableBorder: 'border-stone-100',
    presetActive: 'bg-track-500 text-white shadow-lg shadow-track-500/25',
    presetInactive: 'bg-stone-100 text-stone-600 hover:bg-stone-200',
    unitActive: 'bg-stone-900 text-white',
    unitInactive: 'bg-stone-100 text-stone-500 hover:bg-stone-200',
    sliderTrack: '#E7E5E4',
    sliderFill: '#D94F30',
    modalBtnPrimary: 'bg-track-500 text-white hover:bg-track-600',
    modalBtn: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
  }

  return (
    <div className={`min-h-screen ${theme.bg} track-pattern transition-colors duration-300 print:bg-white`}>
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 print:py-4">

        {/* ── Header ── */}
        <header className="flex justify-between items-start mb-10 print:mb-6 no-print">
          <button
            onClick={() => setShowLangModal(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${theme.card} ${theme.cardBorder} ${theme.text} transition-colors`}
          >
            <GlobeIcon />
            <span className="text-xs tracking-wide">
              {LANGUAGES.find((l) => l.code === lang)?.label}
            </span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-lg ${theme.card} ${theme.cardBorder} ${theme.text} transition-colors`}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        {/* ── Title ── */}
        <div className="text-center mb-8 print:mb-4">
          <h1 className={`font-display text-4xl sm:text-5xl tracking-wide ${theme.text} print:text-3xl print:text-black`}>
            {t('title')}
          </h1>
          <p className={`${theme.textMuted} mt-2 text-sm no-print`}>
            {t('subtitle')}
          </p>
        </div>

        {/* ── Time Display ── */}
        <div className={`${theme.card} ${theme.cardBorder} rounded-2xl shadow-sm p-8 sm:p-10 mb-6 no-print transition-colors`}>
          <div className="text-center mb-8">
            <div className={`font-display text-7xl sm:text-8xl tracking-wider ${theme.accent} leading-none`}>
              {formatTime(totalFinishSeconds)}
            </div>
            <div className={`${theme.textMuted} mt-2 text-sm font-medium uppercase tracking-widest`}>
              {t('targetFinishTime')}
            </div>
          </div>

          {/* Slider */}
          <div className="mb-8 px-1">
            <input
              type="range"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              value={totalMinutes}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTotalMinutes(parseInt(e.target.value))}
              className="time-slider"
              style={{
                background: `linear-gradient(to right, ${theme.sliderFill} 0%, ${theme.sliderFill} ${sliderPercent}%, ${theme.sliderTrack} ${sliderPercent}%, ${theme.sliderTrack} 100%)`,
              }}
            />
            <div className={`flex justify-between text-xs ${theme.textSubtle} mt-3 px-0.5 font-medium tracking-wide`}>
              <span>2:00</span>
              <span>3:30</span>
              <span>5:00</span>
              <span>7:00</span>
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setTotalMinutes(preset.minutes)}
                className={`px-4 py-2 text-sm rounded-lg font-semibold tracking-wide transition-all ${
                  totalMinutes === preset.minutes
                    ? theme.presetActive
                    : theme.presetInactive
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Unit Toggle */}
          <div className="flex justify-center">
            <div className={`inline-flex rounded-lg p-1 ${darkMode ? 'bg-white/5' : 'bg-stone-100'}`}>
              <button
                onClick={() => setUnit('km')}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${
                  unit === 'km' ? theme.unitActive : theme.unitInactive
                }`}
              >
                {t('kilometers')}
              </button>
              <button
                onClick={() => setUnit('mi')}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${
                  unit === 'mi' ? theme.unitActive : theme.unitInactive
                }`}
              >
                {t('miles')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Stats ── */}
        <div className={`${theme.summaryBg} rounded-2xl p-5 mb-6 print:bg-gray-800 print:rounded-none print:mb-4 transition-colors`}>
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <div className={`text-xs font-medium uppercase tracking-widest ${theme.summaryMuted} mb-1`}>
                {t('targetTime')}
              </div>
              <div className={`font-display text-3xl tracking-wider ${theme.summaryText} print:text-xl`}>
                {formatTime(totalFinishSeconds)}
              </div>
            </div>
            <div>
              <div className={`text-xs font-medium uppercase tracking-widest ${theme.summaryMuted} mb-1`}>
                {t('pace')}/{unit === 'km' ? 'km' : 'mi'}
              </div>
              <div className={`font-display text-3xl tracking-wider ${theme.summaryText} print:text-xl`}>
                {unit === 'km' ? formatPace(pacePerKm) : formatPace(pacePerMi)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Pace Table ── */}
        <div className={`${theme.card} ${theme.cardBorder} rounded-2xl shadow-sm overflow-hidden mb-8 pace-table print:shadow-none print:border print:border-gray-300 transition-colors`}>
          <table className="w-full print-compact">
            <thead>
              <tr className={theme.tableHeader}>
                <th className={`px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest ${theme.tableHeaderText} print:text-black print:py-2`}>
                  {t('distance')}
                </th>
                <th className={`px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-widest ${theme.tableHeaderText} print:text-black print:py-2`}>
                  {t('splitTime')}
                </th>
              </tr>
            </thead>
            <tbody>
              {splits.map((split, index) => {
                const isHighlight = split.isHalf || split.isFinish
                return (
                  <tr
                    key={split.label}
                    className={`border-t ${theme.tableBorder} ${
                      isHighlight
                        ? `${theme.tableHighlightBg} row-highlight print:bg-gray-50`
                        : index % 2 === 0
                          ? theme.tableRowAlt
                          : theme.tableRowAlt2
                    } transition-colors`}
                  >
                    <td className={`px-5 py-3 print:py-2 ${theme.text} print:text-black ${isHighlight ? 'font-semibold' : ''}`}>
                      <span className={split.isFinish ? `${theme.accent}` : ''}>
                        {split.isFinish ? '🏁 ' : ''}
                        {split.label}
                      </span>
                    </td>
                    <td className={`px-5 py-3 text-right font-display text-xl tracking-wider ${theme.text} print:py-2 print:text-base print:text-black ${isHighlight ? 'font-semibold' : ''}`}>
                      {split.splitTime}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap justify-center gap-3 mb-4 no-print">
          <button
            onClick={generatePaceCardImage}
            disabled={isGenerating}
            className="px-7 py-3 bg-track-500 text-white rounded-xl font-semibold hover:bg-track-600 active:bg-track-700 transition-all shadow-lg shadow-track-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <ShareIcon />
            {isGenerating ? t('generating') : t('share')}
          </button>

          <button
            onClick={() => window.print()}
            className={`px-7 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${theme.card} ${theme.cardBorder} ${theme.text} hover:shadow-md`}
          >
            <PrintIcon />
            {t('print')}
          </button>
        </div>

        <p className={`text-center ${theme.textSubtle} text-xs mt-2 no-print`}>
          {t('settingsSaved')}
        </p>

        {/* Print-only footer */}
        <div className="print-only text-center text-gray-500 text-sm mt-4 border-t pt-2">
          {t('title')} · {unit === 'km' ? '42.195 km' : '26.2 mi'} · {t('targetTime')}: {formatTime(totalFinishSeconds)}
        </div>

        {/* ── Footer ── */}
        <footer className={`text-center ${theme.textSubtle} text-sm mt-10 mb-4 no-print`}>
          <p>{t('goodLuck')}</p>
          <p className="mt-2">
            <a href="https://x.com/matsubokkuri" target="_blank" rel="noopener noreferrer" className={`${theme.accentHover} transition-colors`}>@matsubokkuri</a>
            <span className="mx-2">·</span>
            <a href="https://github.com/matsubo/marathon-pace" target="_blank" rel="noopener noreferrer" className={`${theme.accentHover} transition-colors`}>GitHub</a>
          </p>
        </footer>
      </div>

      {/* ── Language Modal ── */}
      {showLangModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-overlay no-print"
          onClick={() => setShowLangModal(false)}
        >
          <div
            className={`${theme.card} rounded-2xl max-w-sm w-full p-6 modal-content shadow-2xl`}
            onClick={(e: MouseEvent) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-lg font-semibold ${theme.text}`}>Language</h3>
              <button
                onClick={() => setShowLangModal(false)}
                className={`${theme.textMuted} text-2xl leading-none hover:opacity-70 transition-opacity`}
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
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-between ${
                    lang === language.code
                      ? 'bg-track-500 text-white'
                      : theme.modalBtn
                  }`}
                >
                  <span>{language.name}</span>
                  <span className="text-sm opacity-60">{language.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Share Modal ── */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-overlay no-print"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className={`${theme.card} rounded-2xl max-w-lg w-full p-6 modal-content shadow-2xl`}
            onClick={(e: MouseEvent) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className={`text-lg font-semibold ${theme.text}`}>
                {t('shareYourPace')}
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className={`${theme.textMuted} text-2xl leading-none hover:opacity-70 transition-opacity`}
              >
                ×
              </button>
            </div>

            {generatedImage && (
              <div className={`mb-5 rounded-xl overflow-hidden ${theme.cardBorder}`}>
                <img src={generatedImage} alt="Pace Card" className="w-full" />
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={downloadImage}
                className={`w-full px-4 py-3 ${theme.modalBtn} rounded-xl font-medium transition-all flex items-center justify-center gap-2`}
              >
                <DownloadIcon />
                {t('downloadImage')}
              </button>

              <button
                onClick={copyLink}
                className={`w-full px-4 py-3 ${linkCopied ? 'bg-emerald-600 text-white' : theme.modalBtn} rounded-xl font-medium transition-all flex items-center justify-center gap-2`}
              >
                {linkCopied ? <CheckIcon /> : <LinkIcon />}
                {linkCopied ? t('linkCopied') : t('copyLink')}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={shareToX}
                  className="flex-1 px-4 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
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

            <p className={`text-center ${theme.textMuted} text-xs mt-4`}>
              {t('downloadTip')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
