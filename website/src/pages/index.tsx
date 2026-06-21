import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import DocsHomeExperience from '@site/src/components/DocsHomeExperience';
import type { JSX } from 'react';

function DocsHomeFallback(): JSX.Element {
  const { siteConfig, i18n } = useDocusaurusContext();
  const isHe = i18n.currentLocale === 'he';
  return (
    <main style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <h1>{siteConfig.title}</h1>
      <p>{isHe ? siteConfig.tagline : siteConfig.tagline}</p>
    </main>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <BrowserOnly fallback={<DocsHomeFallback />}>
        {() => <DocsHomeExperience />}
      </BrowserOnly>
    </Layout>
  );
}
