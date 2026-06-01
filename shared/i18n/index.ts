import en from './locales/en'
import he from './locales/he'
import { createTranslator } from './translator'
import type { AppLocale, MessageTree } from './types'
import type { TranslateFn } from './translator'
import { DEFAULT_LOCALE } from './types'

const MESSAGES: Record<AppLocale, MessageTree> = { en, he }

export function getMessages(locale: AppLocale): MessageTree {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE]
}

export function createLocaleTranslator(locale: AppLocale): TranslateFn {
  return createTranslator(getMessages(locale))
}

/** Map internal tab id (English) to i18n key under `tabs`. */
const TAB_KEYS: Record<string, string> = {
  organization: 'tabs.organization',
  enterprise: 'tabs.enterprise',
  team: 'tabs.team',
  teams: 'tabs.teams',
  languages: 'tabs.languages',
  editors: 'tabs.editors',
  'copilot chat': 'tabs.copilotChat',
  'usage insights': 'tabs.usageInsights',
  users: 'tabs.users',
  'usage & billing': 'tabs.usageBilling',
  'seat analysis': 'tabs.seatAnalysis',
  'api response': 'tabs.apiResponse',
}

export function translateTab(tab: string, t: TranslateFn): string {
  const key = TAB_KEYS[tab]
  return key ? t(key) : tab
}

export * from './types'
export { createTranslator, type TranslateFn } from './translator'
export { buildPageTitle, type PageTitleConfig } from './buildPageTitle'
