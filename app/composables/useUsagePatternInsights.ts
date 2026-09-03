import type { Ref } from 'vue'
import { computed } from 'vue'
import type { UsageActivityInput, UserUsageInsight } from '../../shared/types/usage-pattern'
import { buildUsageInsightsMap } from '../../shared/utils/usage-pattern-insights'

export function useUsagePatternInsights(users: Ref<UsageActivityInput[]>) {
  const insightsByLogin = computed(() => buildUsageInsightsMap(users.value))

  function getInsight(login: string | undefined | null): UserUsageInsight | undefined {
    if (!login) return undefined
    return insightsByLogin.value.get(login.toLowerCase())
  }

  return { insightsByLogin, getInsight }
}
