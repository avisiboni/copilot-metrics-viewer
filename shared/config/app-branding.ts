/** Default branding when env vars are unset (see NUXT_PUBLIC_BRAND_*). */
export const APP_BRANDING_DEFAULTS = {
  logoPath: '/brand/logo.png',
  logoAlt: 'Copilot Metrics',
  appName: 'Copilot Metrics Viewer',
  metaDescription: 'Copilot Metrics Dashboard',
  footerProjectUrl: 'https://github.com/github-copilot-resources/copilot-metrics-viewer',
  faviconPath: '/brand/logo.png',
} as const

/** Public URL or site-root path for static assets under `public/`. */
export function resolveBrandAssetUrl(path: string | undefined): string {
  const raw = (path || APP_BRANDING_DEFAULTS.logoPath).trim()
  if (/^https?:\/\//i.test(raw)) {
    return raw
  }
  return raw.startsWith('/') ? raw : `/${raw}`
}
