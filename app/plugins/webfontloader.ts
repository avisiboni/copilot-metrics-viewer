/**
 * Brand typography: SimplerPro_Menora (licensed) — Assistant as web fallback (book25.pdf).
 * https://fonts.google.com/specimen/Assistant
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vuetify:before-create', async (_) => {
    if (import.meta.client) {
      await loadFonts()
    }
  })
})

async function loadFonts() {
  const webFontLoader = await import(/* webpackChunkName: "webfontloader" */ 'webfontloader')

  webFontLoader.load({
    google: {
      families: ['Assistant:300,400,500,600,700&display=swap'],
    },
  })
}
