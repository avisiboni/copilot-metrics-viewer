import type { AiAdoptionPhaseAggregate, AiAdoptionPhaseId } from '../types/copilot-usage'

export const ADOPTION_PHASE_ORDER: AiAdoptionPhaseId[] = [0, 1, 2, 3]

export const ADOPTION_IDE_ONLY_PHASE_ORDER: AiAdoptionPhaseId[] = [0, 1]

export function isAdoptionIdeOnlyEnabled(
  publicConfig: { adoptionIdeOnly?: boolean }
): boolean {
  return publicConfig.adoptionIdeOnly === true
}

export function isAgentAdoptionPhase(phase: AiAdoptionPhaseId | undefined): boolean {
  return phase === 2 || phase === 3
}

export function adoptionPhaseOrder(ideOnly: boolean): AiAdoptionPhaseId[] {
  return ideOnly ? ADOPTION_IDE_ONLY_PHASE_ORDER : ADOPTION_PHASE_ORDER
}

export function filterAdoptionPhasesForDisplay(
  phases: AiAdoptionPhaseAggregate[],
  ideOnly: boolean
): AiAdoptionPhaseAggregate[] {
  if (!ideOnly) {
    return phases
  }
  return phases.filter((row) => row.phase === 0 || row.phase === 1)
}
