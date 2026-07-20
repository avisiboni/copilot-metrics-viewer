<template>
  <v-card v-if="insight" variant="outlined" class="pa-3 mb-4 user-usage-insight-panel">
    <div class="d-flex flex-wrap align-center justify-space-between gap-2 mb-3">
      <div>
        <div class="text-subtitle-1 font-weight-medium">
          {{ t('usagePattern.panelTitle') }}
        </div>
        <div class="text-caption text-medium-emphasis">
          {{ t('usagePattern.panelSubtitle', { count: insight.orgUserCount }) }}
        </div>
      </div>
      <div class="d-flex flex-wrap align-center ga-2">
        <BrandUsagePatternChip :insight="insight" :top-model="topModel" />
        <v-chip size="x-small" variant="tonal" class="brand-filter-chip">
          {{ t(`usagePattern.confidence.${insight.confidence}`) }}
        </v-chip>
        <v-chip size="x-small" variant="tonal" class="brand-filter-chip">
          {{ t('usagePattern.engagementScoreShort', { score: insight.engagementScore }) }}
        </v-chip>
        <v-chip
          size="x-small"
          variant="flat"
          :color="effectivenessColor"
          class="brand-effectiveness-chip"
        >
          {{ effectivenessLabel }}
        </v-chip>
      </div>
    </div>

    <p class="text-body-2 mb-3">
      {{ t(`usagePattern.pattern.${insight.patternId}.hint`) }}
    </p>

    <v-alert
      v-if="recommendationHeadline"
      :type="recommendationAlertType"
      variant="tonal"
      density="comfortable"
      class="mb-4 brand-alert user-usage-insight-panel__reco"
    >
      <div class="text-subtitle-2 font-weight-medium mb-1">
        {{ t('usagePattern.recommendationsTitle') }}
      </div>
      <p class="text-caption text-medium-emphasis mb-2">
        {{ t('usagePattern.recommendationsSubtitle') }}
      </p>
      <p class="text-body-2 font-weight-medium mb-3">
        {{ recommendationHeadline }}
      </p>
      <ul class="user-usage-insight-panel__reco-list pl-4 mb-0">
        <li
          v-for="(line, index) in recommendationActions"
          :key="index"
          class="text-body-2 mb-2"
        >
          {{ line }}
        </li>
      </ul>
    </v-alert>

    <v-alert
      v-if="coachingHintLines.length"
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-4 brand-alert user-usage-insight-panel__reco"
    >
      <div class="text-subtitle-2 font-weight-medium mb-1">
        {{ t('usageCoaching.panelTitle') }}
      </div>
      <p class="text-caption text-medium-emphasis mb-2">
        {{ t('usageCoaching.panelSubtitle') }}
      </p>
      <ul class="user-usage-insight-panel__reco-list pl-4 mb-2">
        <li
          v-for="(line, index) in coachingHintLines"
          :key="index"
          class="text-body-2 mb-2"
        >
          {{ line }}
        </li>
      </ul>
      <p class="text-caption text-medium-emphasis mb-0">
        {{ t('usageCoaching.planModeNote', { feature: planModeFeature }) }}
      </p>
    </v-alert>

    <v-alert type="info" variant="tonal" density="compact" class="mb-3 brand-alert brand-alert--info">
      {{ t('usagePattern.disclaimer') }}
    </v-alert>

    <div class="text-subtitle-2 mb-2">{{ t('usagePattern.ratesTitle') }}</div>
    <v-table density="compact" class="user-usage-insight-panel__table mb-4">
      <thead>
        <tr>
          <th>{{ t('usagePattern.colMetric') }}</th>
          <th class="text-end">{{ t('usagePattern.colValue') }}</th>
          <th class="text-end">{{ t('usagePattern.colOrgMedian') }}</th>
          <th class="text-end">{{ t('usagePattern.colPercentile') }}</th>
          <th>{{ t('usagePattern.colFormula') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rateRows" :key="row.id">
          <td class="font-weight-medium">{{ row.label }}</td>
          <td class="text-end brand-table-metric">{{ row.value }}</td>
          <td class="text-end text-medium-emphasis">{{ row.median }}</td>
          <td class="text-end brand-table-metric">{{ row.percentile }}</td>
          <td class="text-caption text-medium-emphasis">{{ row.formula }}</td>
        </tr>
      </tbody>
    </v-table>

    <div class="text-subtitle-2 mb-2">{{ t('usagePattern.rawCountsTitle') }}</div>
    <v-row dense>
      <v-col v-for="raw in rawRows" :key="raw.label" cols="6" sm="3">
        <div class="text-caption text-medium-emphasis">{{ raw.label }}</div>
        <div class="text-body-1 font-weight-medium">{{ raw.value }}</div>
        <div class="text-caption">{{ raw.percentile }}</div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import type { UsageEffectiveness, UserUsageInsight } from '../../shared/types/usage-pattern'
import type { UsageCoachingHint } from '../../shared/utils/usage-coaching-hints'
import BrandUsagePatternChip from '@/components/BrandUsagePatternChip.vue'
import { PLAN_MODE_FEATURE } from '../../shared/utils/usage-coaching-hints'

const EFFECTIVENESS_COLORS: Record<UsageEffectiveness, string> = {
  unknown: '#94a3b8',
  idle: '#f97316',
  building: '#0ea5e9',
  productive: '#22c55e',
  mixed: '#eab308',
  high_volume_low_fit: '#ef4444'
}

const ALERT_TYPES: Record<UsageEffectiveness, 'info' | 'warning' | 'success' | 'error'> = {
  unknown: 'info',
  idle: 'warning',
  building: 'info',
  productive: 'success',
  mixed: 'warning',
  high_volume_low_fit: 'error'
}

export default defineComponent({
  name: 'UserUsageInsightPanel',
  components: { BrandUsagePatternChip },
  props: {
    insight: {
      type: Object as () => UserUsageInsight | null | undefined,
      default: null
    },
    raw: {
      type: Object as () => {
        interactions: number
        generations: number
        acceptances: number
        locAdded: number
      } | null,
      default: null
    },
    topModel: {
      type: String,
      default: ''
    },
    coachingHints: {
      type: Array as () => UsageCoachingHint[],
      default: () => []
    }
  },
  setup(props) {
    const { t } = useAppI18n()
    const planModeFeature = PLAN_MODE_FEATURE

    const formatPct = (n: number) =>
      new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n)

    const formatNum = (n: number) =>
      new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n)

    const percentileLabel = (p: number) =>
      t.value('usagePattern.percentileVsOrg', { p })

    const recommendation = computed(() => props.insight?.recommendation)

    const effectivenessLabel = computed(() => {
      const eff = recommendation.value?.effectiveness
      if (!eff) return ''
      return t.value(`usagePattern.effectiveness.${eff}`)
    })

    const effectivenessColor = computed(() => {
      const eff = recommendation.value?.effectiveness
      return eff ? EFFECTIVENESS_COLORS[eff] : EFFECTIVENESS_COLORS.unknown
    })

    const recommendationAlertType = computed(() => {
      const eff = recommendation.value?.effectiveness
      return eff ? ALERT_TYPES[eff] : 'info'
    })

    const recommendationHeadline = computed(() => {
      const reco = recommendation.value
      if (!reco) return ''
      return t.value(`usagePattern.headlines.${reco.headlineId}`)
    })

    const recommendationActions = computed(() => {
      const reco = recommendation.value
      if (!reco) return []
      const model = props.topModel || ''
      return reco.actionIds.map((id) =>
        t.value(`usagePattern.actions.${id}`, { model })
      )
    })

    const coachingHintLines = computed(() =>
      props.coachingHints.map((hint) =>
        t.value(`usageCoaching.hints.${hint.id}`, hint.params)
      )
    )

    const rateRows = computed(() => {
      const insight = props.insight
      if (!insight) return []
      const m = insight.orgMedians
      const r = insight.rates
      const p = insight.percentiles
      return [
        {
          id: 'acceptanceRate',
          label: t.value('usagePattern.rates.acceptanceRate.label'),
          value: `${formatPct(r.acceptanceRate)}%`,
          median: `${formatPct(m.acceptanceRate)}%`,
          percentile: percentileLabel(p.acceptanceRate),
          formula: t.value('usagePattern.rates.acceptanceRate.formula')
        },
        {
          id: 'generationsPerInteraction',
          label: t.value('usagePattern.rates.generationsPerInteraction.label'),
          value: formatNum(r.generationsPerInteraction),
          median: formatNum(m.generationsPerInteraction),
          percentile: percentileLabel(p.generationsPerInteraction),
          formula: t.value('usagePattern.rates.generationsPerInteraction.formula')
        },
        {
          id: 'locPerAcceptance',
          label: t.value('usagePattern.rates.locPerAcceptance.label'),
          value: formatNum(r.locPerAcceptance),
          median: formatNum(m.locPerAcceptance),
          percentile: percentileLabel(p.locPerAcceptance),
          formula: t.value('usagePattern.rates.locPerAcceptance.formula')
        },
        {
          id: 'locPerInteraction',
          label: t.value('usagePattern.rates.locPerInteraction.label'),
          value: formatNum(r.locPerInteraction),
          median: formatNum(m.locPerInteraction),
          percentile: percentileLabel(p.locPerInteraction),
          formula: t.value('usagePattern.rates.locPerInteraction.formula')
        },
        {
          id: 'locPerGeneration',
          label: t.value('usagePattern.rates.locPerGeneration.label'),
          value: formatNum(r.locPerGeneration),
          median: formatNum(m.locPerGeneration),
          percentile: percentileLabel(p.locPerGeneration),
          formula: t.value('usagePattern.rates.locPerGeneration.formula')
        }
      ]
    })

    const rawRows = computed(() => {
      const insight = props.insight
      const raw = props.raw
      if (!insight || !raw) return []
      const m = insight.orgMedians
      const p = insight.percentiles
      const fmt = (v: number) => formatNum(v)
      return [
        {
          label: t.value('billing.colInteractions'),
          value: fmt(raw.interactions),
          percentile: `${percentileLabel(p.interactions)} · ${t.value('usagePattern.medianShort', { v: fmt(m.interactions) })}`
        },
        {
          label: t.value('billing.colGenerations'),
          value: fmt(raw.generations),
          percentile: `${percentileLabel(p.generations)} · ${t.value('usagePattern.medianShort', { v: fmt(m.generations) })}`
        },
        {
          label: t.value('billing.colAcceptances'),
          value: fmt(raw.acceptances),
          percentile: `${percentileLabel(p.acceptances)} · ${t.value('usagePattern.medianShort', { v: fmt(m.acceptances) })}`
        },
        {
          label: t.value('billing.colLocAdded'),
          value: fmt(raw.locAdded),
          percentile: `${percentileLabel(p.locAdded)} · ${t.value('usagePattern.medianShort', { v: fmt(m.locAdded) })}`
        }
      ]
    })

    return {
      t,
      effectivenessLabel,
      effectivenessColor,
      recommendationAlertType,
      recommendationHeadline,
      recommendationActions,
      coachingHintLines,
      planModeFeature,
      rateRows,
      rawRows
    }
  }
})
</script>

<style scoped>
.user-usage-insight-panel__table :deep(th) {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.user-usage-insight-panel__table :deep(td) {
  vertical-align: top;
  padding-top: 8px;
  padding-bottom: 8px;
}

.user-usage-insight-panel__reco-list {
  list-style-type: disc;
}

.user-usage-insight-panel__reco :deep(.v-alert__content) {
  width: 100%;
}
</style>
