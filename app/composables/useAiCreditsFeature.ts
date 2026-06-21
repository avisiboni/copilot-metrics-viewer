import { isAiCreditsFetchEnabled } from '../../shared/utils/ai-credits-feature'

export function useAiCreditsFeature() {
  const config = useRuntimeConfig()
  const fetchEnabled = computed(() => isAiCreditsFetchEnabled(config.public))
  return { fetchEnabled }
}
