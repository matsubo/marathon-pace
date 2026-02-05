export type TranslationKey =
  | 'title'
  | 'subtitle'
  | 'targetFinishTime'
  | 'pace'
  | 'distance'
  | 'splitTime'
  | 'targetTime'
  | 'kilometers'
  | 'miles'
  | 'share'
  | 'generating'
  | 'print'
  | 'settingsSaved'
  | 'goodLuck'
  | 'shareYourPace'
  | 'downloadImage'
  | 'shareOnX'
  | 'facebook'
  | 'downloadTip'
  | 'half'
  | 'finish'
  | 'pacePerKm'
  | 'pacePerMile'
  | 'halfMarathon'
  | 'fullMarathon'
  | 'copyLink'
  | 'linkCopied'

export type LangCode = 'en' | 'ja' | 'zh' | 'es' | 'hi'

export type TranslationMap = Record<TranslationKey, string>

export const TRANSLATIONS: Record<LangCode, TranslationMap> = {
  en: {
    title: 'Marathon Pace Chart',
    subtitle: 'Slide to set your target time \u2022 Share & Print for race day',
    targetFinishTime: 'Target Finish Time',
    pace: 'Pace',
    distance: 'Distance',
    splitTime: 'Split Time',
    targetTime: 'Target Time',
    kilometers: 'Kilometers',
    miles: 'Miles',
    share: 'Share',
    generating: 'Generating...',
    print: 'Print',
    settingsSaved: 'Your settings are automatically saved',
    goodLuck: 'Good luck with your marathon!',
    shareYourPace: 'Share Your Pace',
    downloadImage: 'Download Image',
    shareOnX: 'Share on X',
    facebook: 'Facebook',
    downloadTip: 'Download the image and attach it to your post for a beautiful preview!',
    half: 'Half',
    finish: 'Finish',
    pacePerKm: 'Pace per km',
    pacePerMile: 'Pace per mile',
    halfMarathon: 'Half Marathon',
    fullMarathon: 'Full Marathon',
    copyLink: 'Copy Link',
    linkCopied: 'Link Copied!',
  },
  ja: {
    title: '\u30DE\u30E9\u30BD\u30F3\u30DA\u30FC\u30B9\u8868',
    subtitle: '\u30B9\u30E9\u30A4\u30C9\u3067\u76EE\u6A19\u30BF\u30A4\u30E0\u3092\u8A2D\u5B9A \u2022 \u30B7\u30A7\u30A2\uFF06\u5370\u5237\u3057\u3066\u30EC\u30FC\u30B9\u3078',
    targetFinishTime: '\u76EE\u6A19\u30BF\u30A4\u30E0',
    pace: '\u30DA\u30FC\u30B9',
    distance: '\u8DDD\u96E2',
    splitTime: '\u30B9\u30D7\u30EA\u30C3\u30C8',
    targetTime: '\u76EE\u6A19\u30BF\u30A4\u30E0',
    kilometers: '\u30AD\u30ED\u30E1\u30FC\u30C8\u30EB',
    miles: '\u30DE\u30A4\u30EB',
    share: '\u30B7\u30A7\u30A2',
    generating: '\u751F\u6210\u4E2D...',
    print: '\u5370\u5237',
    settingsSaved: '\u8A2D\u5B9A\u306F\u81EA\u52D5\u4FDD\u5B58\u3055\u308C\u307E\u3059',
    goodLuck: '\u30DE\u30E9\u30BD\u30F3\u9811\u5F35\u3063\u3066\u304F\u3060\u3055\u3044\uFF01',
    shareYourPace: '\u30DA\u30FC\u30B9\u3092\u30B7\u30A7\u30A2',
    downloadImage: '\u753B\u50CF\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9',
    shareOnX: 'X\u3067\u30B7\u30A7\u30A2',
    facebook: 'Facebook',
    downloadTip: '\u753B\u50CF\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u3066\u6295\u7A3F\u306B\u6DFB\u4ED8\u3059\u308B\u3068\u7DBE\u9E97\u306B\u8868\u793A\u3055\u308C\u307E\u3059\uFF01',
    half: '\u30CF\u30FC\u30D5',
    finish: '\u30B4\u30FC\u30EB',
    pacePerKm: '\u30AD\u30ED\u30DA\u30FC\u30B9',
    pacePerMile: '\u30DE\u30A4\u30EB\u30DA\u30FC\u30B9',
    halfMarathon: '\u30CF\u30FC\u30D5\u30DE\u30E9\u30BD\u30F3',
    fullMarathon: '\u30D5\u30EB\u30DE\u30E9\u30BD\u30F3',
    copyLink: '\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC',
    linkCopied: '\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F\uFF01',
  },
  zh: {
    title: '\u9A6C\u62C9\u677E\u914D\u901F\u8868',
    subtitle: '\u6ED1\u52A8\u8BBE\u7F6E\u76EE\u6807\u65F6\u95F4 \u2022 \u5206\u4EAB\u548C\u6253\u5370\u5E26\u53BB\u6BD4\u8D5B',
    targetFinishTime: '\u76EE\u6807\u5B8C\u6210\u65F6\u95F4',
    pace: '\u914D\u901F',
    distance: '\u8DDD\u79BB',
    splitTime: '\u5206\u6BB5\u65F6\u95F4',
    targetTime: '\u76EE\u6807\u65F6\u95F4',
    kilometers: '\u516C\u91CC',
    miles: '\u82F1\u91CC',
    share: '\u5206\u4EAB',
    generating: '\u751F\u6210\u4E2D...',
    print: '\u6253\u5370',
    settingsSaved: '\u8BBE\u7F6E\u5DF2\u81EA\u52A8\u4FDD\u5B58',
    goodLuck: '\u795D\u4F60\u9A6C\u62C9\u677E\u987A\u5229\uFF01',
    shareYourPace: '\u5206\u4EAB\u914D\u901F',
    downloadImage: '\u4E0B\u8F7D\u56FE\u7247',
    shareOnX: '\u5206\u4EAB\u5230X',
    facebook: 'Facebook',
    downloadTip: '\u4E0B\u8F7D\u56FE\u7247\u5E76\u9644\u52A0\u5230\u5E16\u5B50\u4E2D\u4EE5\u83B7\u5F97\u7CBE\u7F8E\u9884\u89C8\uFF01',
    half: '\u534A\u7A0B',
    finish: '\u7EC8\u70B9',
    pacePerKm: '\u6BCF\u516C\u91CC\u914D\u901F',
    pacePerMile: '\u6BCF\u82F1\u91CC\u914D\u901F',
    halfMarathon: '\u534A\u7A0B\u9A6C\u62C9\u677E',
    fullMarathon: '\u5168\u7A0B\u9A6C\u62C9\u677E',
    copyLink: '\u590D\u5236\u94FE\u63A5',
    linkCopied: '\u5DF2\u590D\u5236\uFF01',
  },
  es: {
    title: 'Tabla de Ritmo de Marat\u00F3n',
    subtitle: 'Desliza para establecer tu tiempo objetivo \u2022 Comparte e imprime para el d\u00EDa de la carrera',
    targetFinishTime: 'Tiempo Objetivo',
    pace: 'Ritmo',
    distance: 'Distancia',
    splitTime: 'Tiempo Parcial',
    targetTime: 'Tiempo Objetivo',
    kilometers: 'Kil\u00F3metros',
    miles: 'Millas',
    share: 'Compartir',
    generating: 'Generando...',
    print: 'Imprimir',
    settingsSaved: 'Tu configuraci\u00F3n se guarda autom\u00E1ticamente',
    goodLuck: '\u00A1Buena suerte en tu marat\u00F3n!',
    shareYourPace: 'Comparte tu Ritmo',
    downloadImage: 'Descargar Imagen',
    shareOnX: 'Compartir en X',
    facebook: 'Facebook',
    downloadTip: '\u00A1Descarga la imagen y adj\u00FAntala a tu publicaci\u00F3n para una vista previa hermosa!',
    half: 'Media',
    finish: 'Meta',
    pacePerKm: 'Ritmo por km',
    pacePerMile: 'Ritmo por milla',
    halfMarathon: 'Media Marat\u00F3n',
    fullMarathon: 'Marat\u00F3n Completo',
    copyLink: 'Copiar enlace',
    linkCopied: '\u00A1Copiado!',
  },
  hi: {
    title: '\u092E\u0948\u0930\u093E\u0925\u0928 \u092A\u0947\u0938 \u091A\u093E\u0930\u094D\u091F',
    subtitle: '\u0905\u092A\u0928\u093E \u0932\u0915\u094D\u0937\u094D\u092F \u0938\u092E\u092F \u0938\u0947\u091F \u0915\u0930\u0947\u0902 \u2022 \u0930\u0947\u0938 \u0915\u0947 \u0926\u093F\u0928 \u0915\u0947 \u0932\u093F\u090F \u0936\u0947\u092F\u0930 \u0914\u0930 \u092A\u094D\u0930\u093F\u0902\u091F \u0915\u0930\u0947\u0902',
    targetFinishTime: '\u0932\u0915\u094D\u0937\u094D\u092F \u0938\u092E\u092F',
    pace: '\u092A\u0947\u0938',
    distance: '\u0926\u0942\u0930\u0940',
    splitTime: '\u0938\u094D\u092A\u094D\u0932\u093F\u091F \u0938\u092E\u092F',
    targetTime: '\u0932\u0915\u094D\u0937\u094D\u092F \u0938\u092E\u092F',
    kilometers: '\u0915\u093F\u0932\u094B\u092E\u0940\u091F\u0930',
    miles: '\u092E\u0940\u0932',
    share: '\u0936\u0947\u092F\u0930',
    generating: '\u092C\u0928\u093E \u0930\u0939\u093E \u0939\u0948...',
    print: '\u092A\u094D\u0930\u093F\u0902\u091F',
    settingsSaved: '\u0906\u092A\u0915\u0940 \u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938 \u0938\u094D\u0935\u091A\u093E\u0932\u093F\u0924 \u0930\u0942\u092A \u0938\u0947 \u0938\u0939\u0947\u091C\u0940 \u091C\u093E\u0924\u0940 \u0939\u0948\u0902',
    goodLuck: '\u0906\u092A\u0915\u0947 \u092E\u0948\u0930\u093E\u0925\u0928 \u0915\u0947 \u0932\u093F\u090F \u0936\u0941\u092D\u0915\u093E\u092E\u0928\u093E\u090F\u0902!',
    shareYourPace: '\u0905\u092A\u0928\u093E \u092A\u0947\u0938 \u0936\u0947\u092F\u0930 \u0915\u0930\u0947\u0902',
    downloadImage: '\u0907\u092E\u0947\u091C \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902',
    shareOnX: 'X \u092A\u0930 \u0936\u0947\u092F\u0930 \u0915\u0930\u0947\u0902',
    facebook: 'Facebook',
    downloadTip: '\u0907\u092E\u0947\u091C \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902 \u0914\u0930 \u0938\u0941\u0902\u0926\u0930 \u092A\u094D\u0930\u0940\u0935\u094D\u092F\u0942 \u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0928\u0940 \u092A\u094B\u0938\u094D\u091F \u092E\u0947\u0902 \u091C\u094B\u0921\u093C\u0947\u0902!',
    half: '\u0939\u093E\u092B',
    finish: '\u092B\u093F\u0928\u093F\u0936',
    pacePerKm: '\u092A\u094D\u0930\u0924\u093F \u0915\u093F\u092E\u0940 \u092A\u0947\u0938',
    pacePerMile: '\u092A\u094D\u0930\u0924\u093F \u092E\u0940\u0932 \u092A\u0947\u0938',
    halfMarathon: '\u0939\u093E\u092B \u092E\u0948\u0930\u093E\u0925\u0928',
    fullMarathon: '\u092B\u0941\u0932 \u092E\u0948\u0930\u093E\u0925\u0928',
    copyLink: '\u0932\u093F\u0902\u0915 \u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902',
    linkCopied: '\u0915\u0949\u092A\u0940 \u0939\u094B \u0917\u092F\u093E!',
  },
}

export interface Language {
  code: LangCode
  label: string
  name: string
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ja', label: 'JA', name: '\u65E5\u672C\u8A9E' },
  { code: 'zh', label: 'ZH', name: '\u4E2D\u6587' },
  { code: 'es', label: 'ES', name: 'Espa\u00F1ol' },
  { code: 'hi', label: 'HI', name: '\u0939\u093F\u0928\u094D\u0926\u0940' },
]
