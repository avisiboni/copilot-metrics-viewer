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
    // Static Docusaurus site lives in public/docs/ (see npm run docs:embed)
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

  // when enabling ssr option you need to disable inlineStyles and maybe devLogs
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
      // check https://nuxt.vuetifyjs.com/guide/server-side-rendering.html
      ssrClientHints: {
        reloadOnFirstRequest: false,
        viewportSize: true,
        prefersColorScheme: false,

        prefersColorSchemeOptions: {
          useBrowserThemeOnly: false,
        },
      },

      // /* If customizing sass global variables ($utilities, $reset, $color-pack, $body-font-family, etc) */
      // disableVuetifyStyles: true,
      styles: {
        configFile: 'assets/settings.scss',
      },
    },
  },

  auth: {
    github: {
      enabled: true,
      clientId: '',
      clientSecret: ''
    }
  },
  nitro: {
    plugins: [
      'plugins/http-agent',
      'plugins/security',
    ],
  },
  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
  },
  runtimeConfig: {
    githubToken: '',
    session: {
      // set to 6h - same as the GitHub token
      maxAge: 60 * 60 * 6,
      password: '',
    },
    oauth: {
      github: {
        clientId: '',
        clientSecret: ''
      }
    },
    public: {
      isDataMocked: isEnvTruthy(process.env.NUXT_PUBLIC_IS_DATA_MOCKED),
      scope: 'organization',  // can be overridden by NUXT_PUBLIC_SCOPE environment variable
      githubOrg: '',
      githubEnt: '',
      githubTeam: '',
      usingGithubAuth: isEnvTruthy(process.env.NUXT_PUBLIC_USING_GITHUB_AUTH),
      version,
      isPublicApp: false,
      /** Included premium requests per user/month (Copilot Enterprise). Overridden when billing API returns totalMonthlyQuota. */
      enterprisePremiumQuota: Number(process.env.NUXT_PUBLIC_ENTERPRISE_PREMIUM_QUOTA) || 1000,
      /** Docs path or URL. Default `/docs` — same host, path folder (not a subdomain). */
      docsUrl: process.env.NUXT_PUBLIC_DOCS_URL || '/docs',
      /**
       * When false, skips GitHub Billing API fetches for per-user premium credits (PRU).
       * Set NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=false while enterprise billing / IP allow list is pending.
       */
      premiumCreditsFetchEnabled: process.env.NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED === undefined
        ? true
        : isEnvTruthy(process.env.NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED),
      /** Path under `public/` or absolute URL — sidebar logo */
      brandLogoPath:
        process.env.NUXT_PUBLIC_BRAND_LOGO_PATH || APP_BRANDING_DEFAULTS.logoPath,
      brandLogoAlt:
        process.env.NUXT_PUBLIC_BRAND_LOGO_ALT || APP_BRANDING_DEFAULTS.logoAlt,
      brandAppName:
        process.env.NUXT_PUBLIC_BRAND_APP_NAME || APP_BRANDING_DEFAULTS.appName,
      brandMetaDescription:
        process.env.NUXT_PUBLIC_BRAND_META_DESCRIPTION || APP_BRANDING_DEFAULTS.metaDescription,
      brandFooterProjectUrl:
        process.env.NUXT_PUBLIC_BRAND_FOOTER_PROJECT_URL || APP_BRANDING_DEFAULTS.footerProjectUrl,
      brandFaviconPath:
        process.env.NUXT_PUBLIC_BRAND_FAVICON_PATH || APP_BRANDING_DEFAULTS.faviconPath,
    }
  }
})