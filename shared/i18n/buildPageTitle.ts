import type { TranslateFn } from './translator'

export interface PageTitleConfig {
  githubOrg: string
  githubEnt: string
  githubTeam: string
}

export function buildPageTitle(
  t: TranslateFn,
  cfg: PageTitleConfig,
  appName: string,
): string {
  const scope = cfg.githubEnt ? t('header.scopeEnterprise') : t('header.scopeOrganization')
  const name = cfg.githubOrg || cfg.githubEnt || ''
  const team =
    cfg.githubTeam && String(cfg.githubTeam).trim() !== ''
      ? t('header.teamSuffix', { team: cfg.githubTeam })
      : ''
  return t('header.pageTitle', {
    appName,
    scope,
    name,
    team,
  })
}
