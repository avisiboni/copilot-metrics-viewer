import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home(): JSX.Element {
  const { siteConfig, i18n } = useDocusaurusContext();
  const isHe = i18n.currentLocale === 'he';
  const introPath =
    (siteConfig.customFields?.introDocPath as string | undefined) ?? '/docs/intro';
  const userGuidePath =
    (siteConfig.customFields?.userGuidePath as string | undefined) ?? '/docs/user-guide/overview';

  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}>
      <main className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>
            {isHe ? 'Copilot Metrics Viewer' : 'Copilot Metrics Viewer'}
          </h1>
          <p className={styles.tagline}>
            {isHe
              ? 'תיעוד מלא — מדריך למשתמש, התקנה, פריסה ב-OpenShift ופתרון תקלות'
              : 'Full documentation — user guide, setup, OpenShift deployment, troubleshooting'}
          </p>
          <div className={styles.actions}>
            <Link className="button button--primary button--lg" to={introPath}>
              {isHe ? 'התחל לקרוא' : 'Get started'}
            </Link>
            <Link className="button button--secondary button--lg" to={userGuidePath}>
              {isHe ? 'מדריך למשתמש' : 'User guide'}
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
