import { LOCALE_META } from '../../shared/i18n'

export default defineNuxtPlugin(() => {
  const { locale } = useAppI18n()

  const applyDocumentLocale = () => {
    const meta = LOCALE_META[locale.value]
    useHead({
      htmlAttrs: {
        lang: meta.htmlLang,
        dir: meta.dir,
      },
    })
  }

  applyDocumentLocale()

  watch(locale, () => {
    applyDocumentLocale()
  })
})
