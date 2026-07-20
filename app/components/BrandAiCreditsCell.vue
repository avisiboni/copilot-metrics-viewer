<template>
  <div v-if="loading" class="brand-credits-cell brand-credits-cell--loading">
    <v-progress-circular indeterminate size="18" width="2" color="primary" />
    <span class="text-caption text-medium-emphasis ms-2">{{ t('billing.aiCreditsLoading') }}</span>
  </div>
  <div v-else-if="credits?.source === 'billing' || credits?.source === 'metrics'" class="brand-credits-cell">
    <div class="brand-credits-cell__meta">
      <strong>{{ formatUsed }}</strong>
      <span v-if="credits.netAmount != null && credits.netAmount > 0" class="brand-credits-cell__sep">
        ·
      </span>
      <span v-if="credits.netAmount != null && credits.netAmount > 0">
        {{ formatCurrency(credits.netAmount) }}
      </span>
      <span
        v-if="credits.source === 'metrics'"
        class="brand-credits-cell__estimated text-medium-emphasis"
        :title="t('billing.aiCreditsFromMetricsHint')"
      >
        ({{ t('billing.aiCreditsFromMetrics') }})
      </span>
      <span
        v-if="credits.exceedsQuota"
        class="brand-credits-cell__estimated text-warning"
        :title="t('billing.aiCreditsExceedsQuotaHint')"
      >
        {{ t('billing.aiCreditsExceedsQuota') }}
      </span>
    </div>
  </div>
  <div v-else-if="credits?.source === 'unavailable'" class="brand-credits-cell">
    <span class="brand-credits-cell__estimated" :title="t('billing.aiCreditsPerUserUnavailableHint')">
      {{ t('billing.aiCreditsPerUserUnavailable') }}
    </span>
  </div>
  <span v-else class="brand-credits-cell--na" :title="t('billing.billingApiRequired')">
    {{ t('common.na') }}
  </span>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import type { UserAiCredits } from '../../shared/types/copilot-usage'

export default defineComponent({
  name: 'BrandAiCreditsCell',
  props: {
    credits: {
      type: Object as PropType<UserAiCredits | undefined>,
      default: undefined
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { t } = useAppI18n()

    const formatUsed = computed(() => {
      const used = props.credits?.used ?? 0
      return t.value('billing.aiCreditsUsed', {
        count: new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(used)
      })
    })

    const formatCurrency = (n: number) =>
      new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)

    return { t, formatUsed, formatCurrency }
  }
})
</script>
