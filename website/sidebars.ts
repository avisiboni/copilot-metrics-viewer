import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'מדריך למשתמש',
      link: { type: 'doc', id: 'user-guide/overview' },
      items: [
        'user-guide/overview',
        'user-guide/navigation-and-dates',
        'user-guide/organization',
        'user-guide/teams',
        'user-guide/users',
        {
          type: 'category',
          label: 'מדריך רכיבי UI',
          link: { type: 'doc', id: 'user-guide/ui-reference/overview' },
          items: [
            'user-guide/ui-reference/overview',
            'user-guide/ui-reference/shell-navigation',
            'user-guide/ui-reference/organization-metrics',
            'user-guide/ui-reference/ai-adoption-cohorts',
            'user-guide/ui-reference/users-tab',
            'user-guide/ui-reference/users-table-columns',
            'user-guide/ui-reference/premium-credits',
            'user-guide/ui-reference/user-usage-detail-dialog',
            'user-guide/ui-reference/usage-billing-tab',
          ],
        },
        'user-guide/usage-billing',
        'user-guide/usage-insights',
        'user-guide/seat-analysis',
        'user-guide/export',
      ],
    },
    {
      type: 'category',
      label: 'התקנה והגדרה',
      link: { type: 'doc', id: 'setup/overview' },
      items: [
        'setup/getting-started',
        'setup/overview',
        'setup/local-development',
        'setup/configuration',
        'setup/authentication',
      ],
    },
    {
      type: 'category',
      label: 'פריסה',
      link: { type: 'doc', id: 'deployment/overview' },
      items: [
        'deployment/overview',
        'deployment/docker',
        'deployment/openshift',
        'deployment/azure',
        'deployment/health-checks',
      ],
    },
    {
      type: 'category',
      label: 'עזרה ופתרון תקלות',
      link: { type: 'doc', id: 'troubleshooting/overview' },
      items: ['troubleshooting/overview', 'troubleshooting/billing-api'],
    },
    {
      type: 'category',
      label: 'התייחסות',
      items: [
        'reference/environment-variables',
        'reference/app-and-docs-site',
        'reference/recent-features',
        'reference/api-routes',
        'reference/scopes',
        'reference/github-network-endpoints',
      ],
    },
    {
      type: 'category',
      label: 'תרומה לפרויקט',
      items: ['contributing/overview', 'contributing/translations'],
    },
  ],
};

export default sidebars;
