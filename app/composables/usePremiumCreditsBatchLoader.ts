import { ref, type Ref } from 'vue'
import type { UserPremiumCredits, UserUsageRecord } from '../../shared/types/copilot-usage'
import { PREMIUM_CREDITS_FETCH_BATCH_SIZE } from '../../shared/utils/premium-credits-constants'
import { isPremiumCreditsFetchEnabled } from '../../shared/utils/premium-credits-feature'

export type PremiumCreditsBatchResponse = {
  since: string
  until: string
  defaultQuota: number
  cacheTtlMinutes: number
  billingAvailable: boolean
  orgUserFilterBlocked?: boolean
  fromCache: string[]
  credits: Record<string, UserPremiumCredits>
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

export function usePremiumCreditsBatchLoader(users: Ref<UserUsageRecord[]>) {
  const premiumLoading = ref(false)
  const premiumLoadProgress = ref({ loaded: 0, total: 0 })
  const premiumLoadError = ref<string | null>(null)
  let loadGeneration = 0

  const applyCreditsToUsers = (credits: Record<string, UserPremiumCredits>) => {
    const byLogin = new Map(
      Object.entries(credits).map(([k, v]) => [k.toLowerCase(), v])
    )
    users.value = users.value.map((user) => {
      const premium = byLogin.get(user.user_login.toLowerCase())
      return premium ? { ...user, premium_credits: premium } : user
    })
  }

  const loadPremiumCreditsInBackground = async (params: {
    logins: string[]
    since?: string
    until?: string
    day?: string
    billingAvailable: boolean
  }) => {
    const config = useRuntimeConfig()
    if (
      !isPremiumCreditsFetchEnabled(config.public) ||
      !params.billingAvailable ||
      params.logins.length === 0
    ) {
      return
    }

    const generation = ++loadGeneration
    premiumLoading.value = true
    premiumLoadError.value = null
    premiumLoadProgress.value = { loaded: 0, total: params.logins.length }

    const batches = chunk(params.logins, PREMIUM_CREDITS_FETCH_BATCH_SIZE)

    try {
      for (const batch of batches) {
        if (generation !== loadGeneration) return

        const body: Record<string, string | string[]> = { logins: batch }
        if (params.day) {
          body.day = params.day
        } else if (params.since && params.until) {
          body.since = params.since
          body.until = params.until
        }

        const response = await $fetch<PremiumCreditsBatchResponse>(
          '/api/user-premium-credits',
          { method: 'POST', body }
        )

        if (generation !== loadGeneration) return
        applyCreditsToUsers(response.credits)
        premiumLoadProgress.value.loaded = Math.min(
          params.logins.length,
          premiumLoadProgress.value.loaded + batch.length
        )
      }
    } catch (err: unknown) {
      if (generation === loadGeneration) {
        premiumLoadError.value =
          err instanceof Error ? err.message : 'Failed to load premium credits'
      }
    } finally {
      if (generation === loadGeneration) {
        premiumLoading.value = false
      }
    }
  }

  const cancelPremiumCreditsLoad = () => {
    loadGeneration++
    premiumLoading.value = false
  }

  const isPremiumLoginLoading = (login: string) => {
    if (!premiumLoading.value) return false
    const user = users.value.find(
      (u) => u.user_login.toLowerCase() === login.toLowerCase()
    )
    return !user?.premium_credits
  }

  return {
    premiumLoading,
    premiumLoadProgress,
    premiumLoadError,
    loadPremiumCreditsInBackground,
    cancelPremiumCreditsLoad,
    isPremiumLoginLoading
  }
}
