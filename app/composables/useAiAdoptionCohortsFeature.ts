import { isAiAdoptionCohortsVisible } from '../../shared/utils/ai-adoption-cohorts-feature'

export function useAiAdoptionCohortsFeature() {
  const config = useRuntimeConfig()
  const visible = computed(() => isAiAdoptionCohortsVisible(config.public))
  return { visible }
}
