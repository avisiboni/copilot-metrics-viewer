import { ref, type Ref } from 'vue'
import type { UserAiCredits, UserUsageRecord } from '../../shared/types/copilot-usage'
import { AI_CREDITS_FETCH_BATCH_SIZE } from '../../shared/utils/ai-credits-constants'
import { isAiCreditsFetchEnabled } from '../../shared/utils/ai-credits-feature'

export type AiCreditsBatchResponse = {
  since: string
  until: string
  cacheTtlMinutes: number
  billingAvailable: boolean
  orgUserFilterBlocked?: boolean
  fromCache: string[]
  credits: Record<string, UserAiCredits>
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

export function useAiCreditsBatchLoader(users: Ref<UserUsageRecord[]>) {
  const aiCreditsLoading = ref(false)
  const aiCreditsLoadProgress = ref({ loaded: 0, total: 0 })
  const aiCreditsLoadError = ref<string | null>(null)
  let loadGeneration = 0

  const applyCreditsToUsers = (credits: Record<string, UserAiCredits>) => {
    const byLogin = new Map(
      Object.entries(credits).map(([k, v]) => [k.toLowerCase(), v])
    )
    users.value = users.value.map((user) => {
      const aiCredits = byLogin.get(user.user_login.toLowerCase())
      return aiCredits ? { ...user, ai_credits: aiCredits } : user
    })
  }

  const loadAiCreditsInBackground = async (params: {
    logins: string[]
    since?: string
    until?: string
    day?: string
    billingAvailable: boolean
  }) => {
    const config = useRuntimeConfig()
    if (
      !isAiCreditsFetchEnabled(config.public) ||
      !params.billingAvailable ||
      params.logins.length === 0
    ) {
      return
    }

    const generation = ++loadGeneration
    aiCreditsLoading.value = true
    aiCreditsLoadError.value = null
    aiCreditsLoadProgress.value = { loaded: 0, total: params.logins.length }

    const batches = chunk(params.logins, AI_CREDITS_FETCH_BATCH_SIZE)

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

        const response = await $fetch<AiCreditsBatchResponse>(
          '/api/user-ai-credits',
          { method: 'POST', body }
        )

        if (generation !== loadGeneration) return
        applyCreditsToUsers(response.credits)
        aiCreditsLoadProgress.value.loaded = Math.min(
          params.logins.length,
          aiCreditsLoadProgress.value.loaded + batch.length
        )
      }
    } catch (err: unknown) {
      if (generation === loadGeneration) {
        aiCreditsLoadError.value =
          err instanceof Error ? err.message : 'Failed to load AI credits'
      }
    } finally {
      if (generation === loadGeneration) {
        aiCreditsLoading.value = false
      }
    }
  }

  const cancelAiCreditsLoad = () => {
    loadGeneration++
    aiCreditsLoading.value = false
  }

  const isAiCreditsLoginLoading = (login: string) => {
    if (!aiCreditsLoading.value) return false
    const user = users.value.find(
      (u) => u.user_login.toLowerCase() === login.toLowerCase()
    )
    return !user?.ai_credits
  }

  return {
    aiCreditsLoading,
    aiCreditsLoadProgress,
    aiCreditsLoadError,
    loadAiCreditsInBackground,
    cancelAiCreditsLoad,
    isAiCreditsLoginLoading
  }
}
