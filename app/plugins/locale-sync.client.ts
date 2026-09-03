import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type AppLocale,
} from '../../shared/i18n'

function resolveLocale(cookieValue: AppLocale | null | undefined): AppLocale {
  if (cookieValue && SUPPORTED_LOCALES.includes(cookieValue)) {
    return cookieValue
  }
  return DEFAULT_LOCALE
}

/** Align useState with the cookie set by locale-bootstrap.js before the first paint. */
export default defineNuxtPlugin({
  name: 'locale-sync',
  enforce: 'pre',
  setup() {
    const localeCookie = useCookie<AppLocale>(LOCALE_STORAGE_KEY)
    const locale = useState<AppLocale>('app-locale')
    const resolved = resolveLocale(localeCookie.value)
    if (locale.value !== resolved) {
      locale.value = resolved
    }
  },
})
