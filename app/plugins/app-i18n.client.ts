import { LOCALE_META } from '../../shared/i18n'

export default defineNuxtPlugin((nuxtApp) => {
  const { locale } = useAppI18n()

  const syncVuetifyLocale = () => {
    const vuetify = nuxtApp.$vuetify
    if (!vuetify?.locale) return
    const next = locale.value
    vuetify.locale.current.value = next
    vuetify.locale.isRtl.value = LOCALE_META[next].dir === 'rtl'
  }

  watch(locale, syncVuetifyLocale, { immediate: true })

  nuxtApp.hook('vuetify:ready', syncVuetifyLocale)
})
