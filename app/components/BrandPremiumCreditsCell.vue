<template>
  <div v-if="disabled" class="brand-credits-cell brand-credits-cell--disabled">
    <v-tooltip :text="t('billing.premiumCreditsDisabledIpHint')" location="top" max-width="320">
      <template #activator="{ props: tipProps }">
        <span v-bind="tipProps" class="brand-credits-cell__disabled-note">
          {{ t('billing.premiumCreditsDisabledIpShort') }}
        </span>
      </template>
    </v-tooltip>
  </div>
  <div v-else-if="comingSoon" class="brand-credits-cell brand-credits-cell--coming-soon">
    <v-chip size="small" color="primary" variant="tonal" label>
      {{ t('common.comingSoon') }}
    </v-chip>
  </div>
  <div v-else-if="loading" class="brand-credits-cell brand-credits-cell--loading">
    <v-progress-circular indeterminate size="18" width="2" color="primary" />
    <span class="text-caption text-medium-emphasis ms-2">{{ t('billing.premiumCreditsLoading') }}</span>
  </div>
  <div v-else-if="credits" class="brand-credits-cell">
    <div class="brand-credits-cell__bar-row">
      <v-progress-linear
        :model-value="credits.percentRemaining"
        :color="progressColor"
        bg-color="#e8e8ee"
        height="8"
        rounded
        class="brand-credits-cell__bar"
      />
      <span class="brand-credits-cell__pct">{{ credits.percentRemaining }}%</span>
    </div>
    <div class="brand-credits-cell__meta">
      <strong>{{ formatRemaining }}</strong> {{ t('billing.pruLeft') }}
      <span class="brand-credits-cell__sep">·</span>
      {{ t('billing.usedQuota', { used: credits.used, quota: credits.quota }) }}
      <span
        v-if="credits.source === 'unavailable'"
        class="brand-credits-cell__estimated"
        :title="t('billing.perUserUnavailableHint')"
      >
        {{ t('billing.perUserUnavailable') }}
      </span>
    </div>
  </div>
  <span v-else class="brand-credits-cell--na" :title="t('billing.billingApiRequired')">{{ t('common.na') }}</span>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import type { UserPremiumCredits } from '../../shared/types/copilot-usage'
import { premiumCreditsProgressColor } from '../../shared/utils/premium-credits'

export default defineComponent({
  name: 'BrandPremiumCreditsCell',
  props: {
    credits: {
      type: Object as PropType<UserPremiumCredits | undefined>,
      default: undefined
    },
    loading: {
      type: Boolean,
      default: false
    },
    comingSoon: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { t } = useAppI18n()

    const progressColor = computed(() =>
      props.credits
        ? premiumCreditsProgressColor(
            props.credits.percentRemaining,
            props.credits.source
          )
        : 'primary'
    )

    const formatRemaining = computed(() => {
      if (!props.credits) return ''
      return props.credits.remaining.toLocaleString()
    })

    return { t, progressColor, formatRemaining }
  }
})
</script>
