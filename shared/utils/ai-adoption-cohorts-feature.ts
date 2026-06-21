/** When true, show AI adoption cohort panel, chips, and related table hints. */
export function isAiAdoptionCohortsVisible(
  publicConfig: { showAiAdoptionCohorts?: boolean }
): boolean {
  return publicConfig.showAiAdoptionCohorts === true
}
