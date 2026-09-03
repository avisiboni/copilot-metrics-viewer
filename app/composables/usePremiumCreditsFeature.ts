import { isPremiumCreditsFetchEnabled } from '../../shared/utils/premium-credits-feature'

export function usePremiumCreditsFeature() {
  const config = useRuntimeConfig()
  const fetchEnabled = computed(() =>
    isPremiumCreditsFetchEnabled(config.public)
  )
  return { fetchEnabled }
}
