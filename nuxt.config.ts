// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'fs';
import { APP_BRANDING_DEFAULTS } from './shared/config/app-branding';
import { isEnvTruthy } from './shared/utils/env-boolean';

const packageJson = readFileSync('package.json', 'utf8');
const version = JSON.parse(packageJson).version;

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },

  ssr: true,

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }
      ],
      script: [
        { src: '/locale-bootstrap.js', tagPosition: 'head' },
      ],
    }
  },
  routeRules: {
    '/docs/**': { headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } },
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'X-DNS-Prefetch-Control': 'off',
      },
    },
  },

  features: {
    inlineStyles: false,
    devLogs: false,
  },

  build: {
    transpile: ['vuetify'],
  },

  css: [
    '@/assets/brand-tokens.css',
    '@/assets/global.css',
  ],
  modules: ['@nuxt/fonts', 'vuetify-nuxt-module', '@nuxt/eslint', 'nuxt-auth-utils'],

  vuetify: {
    moduleOptions: {
      ssrClientHints: {
        reloadOnFirstRequest: false,
        viewportSize: true,
        prefersColorScheme: false,
        prefersColorSchemeOptions: {
          useBrowserThemeOnly: false,
        },
      },
      styles: {
        configFile: 'assets/settings.scss',
      },
    },
  },

  auth: {
    // @ts-expect-error - 'github' is a valid runtime option but not in ModuleOptions types
    github: {
      enabled: true,
      clientId: '',
      clientSecret: ''
    }
  },
  nitro: {
    plugins: [
      'plugins/http-agent',
      'plugins/db-init',
      'plugins/security',
      'plugins/dev-auth-hint',
    ],
  },
  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
  },
  runtimeConfig: {
    githubToken: '',
    githubApiBaseUrl: '',
    aiToken: '',
    aiModel: 'gpt-4o',
    aiMaxToolRounds: '5',
    githubAppId: '',
    githubAppPrivateKey: '',
    session: {
      maxAge: 60 * 60 * 6,
      password: '',
    },
    oauth: {
      github: { clientId: '', clientSecret: '' },
      google: { clientId: '', clientSecret: '' },
      microsoft: { clientId: '', clientSecret: '', tenant: '' },
      auth0: { clientId: '', clientSecret: '', domain: '' },
      keycloak: { clientId: '', clientSecret: '', serverUrl: '', realm: '' }
    },
    authorizedUsers: '',
    authorizedEmailDomains: '',
    public: {
      isDataMocked: isEnvTruthy(process.env.NUXT_PUBLIC_IS_DATA_MOCKED),
      scope: 'organization',
      githubOrg: '',
      githubEnt: '',
      githubTeam: '',
      usingGithubAuth: isEnvTruthy(process.env.NUXT_PUBLIC_USING_GITHUB_AUTH),
      requireAuth: isEnvTruthy(process.env.NUXT_PUBLIC_REQUIRE_AUTH),
      authProviders: process.env.NUXT_PUBLIC_AUTH_PROVIDERS || '',
      version,
      isPublicApp: false,
      deployInfo: process.env.NUXT_PUBLIC_DEPLOY_INFO || '',
      useLegacyApi: isEnvTruthy(process.env.USE_LEGACY_API),
      enableHistoricalMode: isEnvTruthy(process.env.NUXT_PUBLIC_ENABLE_HISTORICAL_MODE),
      hiddenTabs: process.env.NUXT_PUBLIC_HIDDEN_TABS || '',
      enableAiChat: process.env.NUXT_PUBLIC_ENABLE_AI_CHAT === undefined
        ? true
        : isEnvTruthy(process.env.NUXT_PUBLIC_ENABLE_AI_CHAT),
      entraClientId: process.env.NUXT_PUBLIC_ENTRA_CLIENT_ID || '',
      entraTenantId: process.env.NUXT_PUBLIC_ENTRA_TENANT_ID || '',
      enterprisePremiumQuota: Number(process.env.NUXT_PUBLIC_ENTERPRISE_PREMIUM_QUOTA) || 1000,
      docsUrl: process.env.NUXT_PUBLIC_DOCS_URL || '/docs',
      premiumCreditsFetchEnabled: process.env.NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED === undefined
        ? true
        : isEnvTruthy(process.env.NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED),
      brandLogoPath: process.env.NUXT_PUBLIC_BRAND_LOGO_PATH || APP_BRANDING_DEFAULTS.logoPath,
      brandLogoAlt: process.env.NUXT_PUBLIC_BRAND_LOGO_ALT || APP_BRANDING_DEFAULTS.logoAlt,
      brandAppName: process.env.NUXT_PUBLIC_BRAND_APP_NAME || APP_BRANDING_DEFAULTS.appName,
      brandMetaDescription: process.env.NUXT_PUBLIC_BRAND_META_DESCRIPTION || APP_BRANDING_DEFAULTS.metaDescription,
      brandFooterProjectUrl: process.env.NUXT_PUBLIC_BRAND_FOOTER_PROJECT_URL || APP_BRANDING_DEFAULTS.footerProjectUrl,
      brandFaviconPath: process.env.NUXT_PUBLIC_BRAND_FAVICON_PATH || APP_BRANDING_DEFAULTS.faviconPath,
    }
  }
})
