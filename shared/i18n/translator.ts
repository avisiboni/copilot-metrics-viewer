import type { MessageTree, TranslateParams } from './types'

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key]
    return value === undefined ? `{${key}}` : String(value)
  })
}

function resolvePath(messages: MessageTree, key: string): string | undefined {
  const parts = key.split('.')
  let node: string | MessageTree | undefined = messages
  for (const part of parts) {
    if (!node || typeof node !== 'object') return undefined
    node = node[part]
  }
  return typeof node === 'string' ? node : undefined
}

export function createTranslator(messages: MessageTree) {
  return function t(key: string, params?: TranslateParams): string {
    const value = resolvePath(messages, key)
    if (value === undefined) return key
    return interpolate(value, params)
  }
}

export type TranslateFn = ReturnType<typeof createTranslator>
