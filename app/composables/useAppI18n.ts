import {
  createLocaleTranslator,
  DEFAULT_LOCALE,
  LOCALE_META,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  translateTab,
  type AppLocale,
  type TranslateFn,
} from '../../shared/i18n'

function readStoredLocale(): AppLocale {
  if (!import.meta.client) return DEFAULT_LOCALE
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && SUPPORTED_LOCALES.includes(stored as AppLocale)) {
      return stored as AppLocale
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE
}

function resolveLocale(value: AppLocale | null | undefined): AppLocale {
  if (value && SUPPORTED_LOCALES.includes(value)) {
    return value
  }
  return DEFAULT_LOCALE
}

export function useAppI18n() {
  const localeCookie = useCookie<AppLocale>(LOCALE_STORAGE_KEY, {
    default: () => DEFAULT_LOCALE,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  const locale = useState<AppLocale>('app-locale', () => DEFAULT_LOCALE)

  const resolvedFromCookie = resolveLocale(localeCookie.value)
  if (locale.value !== resolvedFromCookie) {
    locale.value = resolvedFromCookie
  }

  if (import.meta.client) {
    const stored = readStoredLocale()
    const next = resolveLocale(stored)
    if (locale.value !== next) {
      locale.value = next
    }
    if (localeCookie.value !== locale.value) {
      localeCookie.value = locale.value
    }
  }

  const meta = computed(() => LOCALE_META[locale.value])
  const isRtl = computed(() => meta.value.dir === 'rtl')

  const t = computed<TranslateFn>(() => createLocaleTranslator(locale.value))

  const localeOptions = computed(() =>
    SUPPORTED_LOCALES.map((code) => ({
      value: code,
      title: LOCALE_META[code].label,
    }))
  )

  function setLocale(next: AppLocale) {
    if (!SUPPORTED_LOCALES.includes(next)) return
    locale.value = next
    localeCookie.value = next
    if (import.meta.client) {
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
    }
  }

  function tabLabel(tab: string): string {
    return translateTab(tab, t.value)
  }

  return {
    locale,
    meta,
    isRtl,
    t,
    localeOptions,
    setLocale,
    tabLabel,
    apiLocale: computed(() => meta.value.apiLocale),
  }
}
