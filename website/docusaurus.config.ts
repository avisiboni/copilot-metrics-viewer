import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

/** Normalize to trailing slash (Docusaurus expects `/` or `/docs/`). */
function normalizeBaseUrl(value: string | undefined): string {
  const raw = (value ?? '/').trim();
  if (raw === '' || raw === '/') return '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

const baseUrl = normalizeBaseUrl(process.env.DOCUSAURUS_BASE_URL);
/** Built for serving under the Nuxt app at `/docs/*` (copied to `public/docs/`). */
const embeddedInApp = baseUrl !== '/';
const docsRouteBasePath = embeddedInApp ? '/' : 'docs';

/** Footer/nav links are written as `/docs/...`; strip prefix when embedded. */
function docTo(path: string): string {
  if (!embeddedInApp) return path;
  if (path === '/docs' || path === '/docs/') return '/';
  return path.startsWith('/docs/') ? path.slice('/docs'.length) : path;
}

const config: Config = {
  title: 'Copilot Metrics Viewer',
  tagline: 'תיעוד מלא לצפייה במדדי GitHub Copilot',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: process.env.DOCUSAURUS_URL ?? 'https://docs.example.com',
  baseUrl,

  customFields: {
    introDocPath: docTo('/docs/intro'),
    userGuidePath: docTo('/docs/user-guide/overview'),
  },

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'he',
    locales: ['he', 'en', 'zh-CN', 'ja', 'es', 'pt-BR', 'ru', 'de', 'ko', 'fr', 'id', 'tr'],
    localeConfigs: {
      he: {
        label: 'עברית',
        direction: 'rtl',
        htmlLang: 'he',
        calendar: 'gregory',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en',
        path: 'en',
      },
      'zh-CN': {
        label: '中文（简体）',
        direction: 'ltr',
        htmlLang: 'zh-CN',
        path: 'zh-CN',
      },
      ja: {
        label: '日本語',
        direction: 'ltr',
        htmlLang: 'ja',
        path: 'ja',
      },
      es: {
        label: 'Español',
        direction: 'ltr',
        htmlLang: 'es',
        path: 'es',
      },
      'pt-BR': {
        label: 'Português (Brasil)',
        direction: 'ltr',
        htmlLang: 'pt-BR',
        path: 'pt-BR',
      },
      ru: {
        label: 'Русский',
        direction: 'ltr',
        htmlLang: 'ru',
        path: 'ru',
      },
      de: {
        label: 'Deutsch',
        direction: 'ltr',
        htmlLang: 'de',
        path: 'de',
      },
      ko: {
        label: '한국어',
        direction: 'ltr',
        htmlLang: 'ko',
        path: 'ko',
      },
      fr: {
        label: 'Français',
        direction: 'ltr',
        htmlLang: 'fr',
        path: 'fr',
      },
      id: {
        label: 'Bahasa Indonesia',
        direction: 'ltr',
        htmlLang: 'id',
        path: 'id',
      },
      tr: {
        label: 'Türkçe',
        direction: 'ltr',
        htmlLang: 'tr',
        path: 'tr',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: docsRouteBasePath,
          sidebarPath: './sidebars.ts',
          editLocalizedFiles: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/logo.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Copilot Metrics',
      logo: {
        alt: 'Copilot Metrics Viewer',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'תיעוד',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'תיעוד',
          items: [
            { label: 'התחלה', to: docTo('/docs/intro') },
            { label: 'מדריך למשתמש', to: docTo('/docs/user-guide/overview') },
          ],
        },
        {
          title: 'מפתחים',
          items: [
            { label: 'התקנה', to: docTo('/docs/setup/overview') },
            { label: 'OpenShift', to: docTo('/docs/deployment/openshift') },
            { label: 'תרגומים', to: docTo('/docs/contributing/translations') },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Copilot Metrics Viewer`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
