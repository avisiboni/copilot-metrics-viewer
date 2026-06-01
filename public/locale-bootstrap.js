/**
 * Runs before Vue hydrates so dir/lang and the locale cookie match stored preference.
 * Prevents RTL/LTR layout flash and broken Vuetify layout on refresh.
 */
(function () {
  var KEY = 'copilot-metrics-viewer-locale'
  var META = {
    he: { dir: 'rtl', lang: 'he' },
    en: { dir: 'ltr', lang: 'en' },
  }

  function readCookie() {
    var escaped = KEY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    var match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : ''
  }

  function readStorage() {
    try {
      return localStorage.getItem(KEY) || ''
    } catch {
      return ''
    }
  }

  function writeCookie(value) {
    var secure = location.protocol === 'https:' ? '; secure' : ''
    document.cookie =
      KEY + '=' + encodeURIComponent(value) + '; path=/; max-age=31536000; samesite=lax' + secure
  }

  function resolveLocale() {
    var fromCookie = readCookie()
    if (fromCookie === 'he' || fromCookie === 'en') return fromCookie
    var fromStorage = readStorage()
    if (fromStorage === 'he' || fromStorage === 'en') return fromStorage
    return ''
  }

  var locale = resolveLocale()
  if (!locale) return

  if (!readCookie()) {
    writeCookie(locale)
  }

  var meta = META[locale]
  if (!meta) return

  var root = document.documentElement
  root.setAttribute('dir', meta.dir)
  root.setAttribute('lang', meta.lang)
})()
