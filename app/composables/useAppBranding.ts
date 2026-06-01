import {
  APP_BRANDING_DEFAULTS,
  resolveBrandAssetUrl,
} from '../../shared/config/app-branding'

export function useAppBranding() {
  const config = useRuntimeConfig()

  return computed(() => {
    const logoPath =
      (config.public.brandLogoPath as string | undefined) ||
      APP_BRANDING_DEFAULTS.logoPath
    const faviconPath =
      (config.public.brandFaviconPath as string | undefined) ||
      APP_BRANDING_DEFAULTS.faviconPath

    return {
      logoSrc: resolveBrandAssetUrl(logoPath),
      logoAlt:
        (config.public.brandLogoAlt as string | undefined) ||
        APP_BRANDING_DEFAULTS.logoAlt,
      appName:
        (config.public.brandAppName as string | undefined) ||
        APP_BRANDING_DEFAULTS.appName,
      metaDescription:
        (config.public.brandMetaDescription as string | undefined) ||
        APP_BRANDING_DEFAULTS.metaDescription,
      footerProjectUrl:
        (config.public.brandFooterProjectUrl as string | undefined) ||
        APP_BRANDING_DEFAULTS.footerProjectUrl,
      faviconHref: resolveBrandAssetUrl(faviconPath),
    }
  })
}
