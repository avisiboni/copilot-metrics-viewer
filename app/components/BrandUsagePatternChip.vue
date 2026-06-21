<template>
  <BrandTooltip v-if="insight" location="top" :max-width="400">
    <template #activator="{ props: tooltipProps }">
      <v-chip
        v-bind="tooltipProps"
        size="small"
        variant="flat"
        :color="chipColor"
        class="brand-usage-pattern-chip"
        :class="{ 'brand-usage-pattern-chip--on-dark': chipTextOnDark }"
        label
      >
        {{ patternLabel }}
      </v-chip>
    </template>
    <v-card class="pa-3 brand-tooltip-card brand-usage-pattern-tooltip">
      <p class="brand-usage-pattern-tooltip__title text-subtitle-2 font-weight-medium mb-1">
        {{ patternLabel }}
      </p>
      <p class="brand-usage-pattern-tooltip__hint text-body-2 mb-2">
        {{ patternHint }}
      </p>
      <ul class="brand-usage-pattern-tooltip__meta text-caption mb-0">
        <li>{{ confidenceLabel }}</li>
        <li>{{ engagementLabel }}</li>
      </ul>
      <template v-if="effectivenessLabel && coachingHeadline">
        <v-divider class="my-2" />
        <p class="brand-usage-pattern-tooltip__effectiveness text-caption font-weight-medium mb-1">
          {{ effectivenessLabel }}
        </p>
        <p class="brand-usage-pattern-tooltip__headline text-body-2 mb-0">
          {{ coachingHeadline }}
        </p>
      </template>
    </v-card>
  </BrandTooltip>
  <span v-else class="text-medium-emphasis">{{ t('usagePattern.noInsight') }}</span>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import type { UserUsageInsight } from '../../shared/types/usage-pattern'
import type { UsagePatternId } from '../../shared/types/usage-pattern'

const CHIP_COLORS: Record<UsagePatternId, string> = {
  insufficient_data: '#94a3b8',
  underuse: '#cbd5e1',
  light_user: '#e2e8f0',
  selective_accepter: '#7c3aed',
  completion_first: '#6436df',
  active_reviewer: '#0d9488',
  efficient_adopter: '#22c55e',
  volume_adopter: '#f59e0b',
  high_try_low_keep: '#ef4444',
  power_user: '#320f5b',
  balanced_user: '#a78bfa'
}

/** Pattern chips on mid/dark fills need light label text (global.css). */
const CHIP_TEXT_ON_DARK: Record<UsagePatternId, boolean> = {
  insufficient_data: false,
  underuse: false,
  light_user: false,
  selective_accepter: true,
  completion_first: true,
  active_reviewer: true,
  efficient_adopter: false,
  volume_adopter: false,
  high_try_low_keep: true,
  power_user: true,
  balanced_user: false
}

export default defineComponent({
  name: 'BrandUsagePatternChip',
  props: {
    insight: {
      type: Object as () => UserUsageInsight | null | undefined,
      default: null
    },
    topModel: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const { t } = useAppI18n()

    const patternLabel = computed(() => {
      if (!props.insight) return t.value('usagePattern.noInsight')
      return t.value(`usagePattern.pattern.${props.insight.patternId}.title`)
    })

    const patternHint = computed(() => {
      if (!props.insight) return ''
      return t.value(`usagePattern.pattern.${props.insight.patternId}.hint`)
    })

    const confidenceLabel = computed(() => {
      if (!props.insight) return ''
      return t.value(`usagePattern.confidence.${props.insight.confidence}`)
    })

    const engagementLabel = computed(() => {
      if (!props.insight) return ''
      return t.value('usagePattern.engagementScoreShort', {
        score: props.insight!.engagementScore
      })
    })

    const effectivenessLabel = computed(() => {
      const eff = props.insight?.recommendation?.effectiveness
      if (!eff) return ''
      return t.value(`usagePattern.effectiveness.${eff}`)
    })

    const coachingHeadline = computed(() => {
      const headlineId = props.insight?.recommendation?.headlineId
      if (!headlineId) return ''
      return t.value(`usagePattern.headlines.${headlineId}`)
    })

    const chipColor = computed(() => {
      if (!props.insight) return undefined
      return CHIP_COLORS[props.insight.patternId] ?? CHIP_COLORS.balanced_user
    })

    const chipTextOnDark = computed(() => {
      if (!props.insight) return false
      return CHIP_TEXT_ON_DARK[props.insight.patternId] ?? false
    })

    return {
      t,
      patternLabel,
      patternHint,
      confidenceLabel,
      engagementLabel,
      effectivenessLabel,
      coachingHeadline,
      chipColor,
      chipTextOnDark
    }
  }
})
</script>
