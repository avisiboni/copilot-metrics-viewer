import {
  adoptionPhaseOrder,
  filterAdoptionPhasesForDisplay,
  isAdoptionIdeOnlyEnabled,
  isAgentAdoptionPhase,
} from '../../shared/utils/adoption-ide-only'
import type { AiAdoptionPhaseAggregate } from '../../shared/types/copilot-usage'

export function useAdoptionIdeOnly() {
  const config = useRuntimeConfig()
  const ideOnly = computed(() => isAdoptionIdeOnlyEnabled(config.public))

  function filterPhases(phases: AiAdoptionPhaseAggregate[]): AiAdoptionPhaseAggregate[] {
    return filterAdoptionPhasesForDisplay(phases, ideOnly.value)
  }

  const phaseOrder = computed(() => adoptionPhaseOrder(ideOnly.value))

  return {
    ideOnly,
    filterPhases,
    phaseOrder,
    isAgentAdoptionPhase,
  }
}
