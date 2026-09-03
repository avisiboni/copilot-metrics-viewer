import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration'
import { en as vuetifyEn, he as vuetifyHe } from 'vuetify/locale'

export default defineVuetifyConfiguration({
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { he: vuetifyHe, en: vuetifyEn },
    rtl: { he: true, en: false },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#6436DF',
          secondary: '#320F5B',
          accent: '#9766FD',
          error: '#F967E4',
          info: '#06C5D7',
          success: '#0998AD',
          warning: '#FFC700',
          background: '#F0F1F6',
          surface: '#FFFFFF',
          'surface-variant': '#DAD9EB',
          'on-surface': '#343546',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-info': '#343546',
          'on-warning': '#343546',
          'on-error': '#FFFFFF',
          'on-success': '#FFFFFF',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
    },
    VCard: {
      rounded: 'lg',
    },
    VTextField: {
      rounded: 'lg',
    },
    VTooltip: {
      contentClass: 'brand-tooltip-overlay',
    },
  },
})
