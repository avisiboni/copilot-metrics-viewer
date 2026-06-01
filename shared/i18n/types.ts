export type AppLocale = 'en' | 'he'

export type MessageTree = {
  [key: string]: string | MessageTree
}

export type TranslateParams = Record<string, string | number | undefined>

export interface LocaleMeta {
  label: string
  dir: 'ltr' | 'rtl'
  htmlLang: string
  /** BCP 47 tag for APIs (holidays, date formatting). */
  apiLocale: string
}

export const LOCALE_STORAGE_KEY = 'copilot-metrics-viewer-locale'

export const LOCALE_META: Record<AppLocale, LocaleMeta> = {
  en: {
    label: 'English',
    dir: 'ltr',
    htmlLang: 'en',
    apiLocale: 'en-US',
  },
  he: {
    label: 'עברית',
    dir: 'rtl',
    htmlLang: 'he',
    apiLocale: 'he-IL',
  },
}

export const DEFAULT_LOCALE: AppLocale = 'en'

export const SUPPORTED_LOCALES: AppLocale[] = ['en', 'he']
