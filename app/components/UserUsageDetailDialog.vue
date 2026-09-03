<template>
  <v-dialog
    :model-value="modelValue"
    max-width="960"
    scrollable
    content-class="user-usage-detail-dialog"
    scrim="rgba(15, 23, 42, 0.55)"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="modelValue && user" class="user-usage-detail" elevation="8">
      <v-card-title class="user-usage-detail__header">
        <div class="brand-table-user-cell">
          <BrandUserAvatar
            :seed="user.user_login"
            :display-name="user.name"
            :size="44"
          />
          <div>
            <div class="d-flex align-center flex-wrap ga-2">
              <div class="text-h6">{{ user.user_login }}</div>
              <BrandAiAdoptionPhaseChip
                v-if="showAiAdoptionCohorts"
                :phase="user.ai_adoption_phase"
              />
            </div>
            <div v-if="user.name || user.email" class="text-body-2 text-medium-emphasis">
              {{ [user.name, user.email].filter(Boolean).join(' · ') }}
            </div>
            <div
              v-if="showAiAdoptionCohorts && user.ai_adoption_phase?.version"
              class="text-caption text-medium-emphasis"
            >
              {{ t('adoption.versionLabel', { version: user.ai_adoption_phase.version }) }}
            </div>
            <div v-if="reportRange" class="text-caption text-medium-emphasis mt-1">
              {{ reportRange }}
            </div>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          :aria-label="t('common.close')"
          @click="emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="user-usage-detail__body">
        <v-row class="mb-4" dense>
          <v-col v-for="kpi in summaryKpis" :key="kpi.label" cols="6" sm="3">
            <v-card variant="flat" class="brand-kpi-card">
              <BrandKpiTooltip :text="kpi.tooltip" />
              <div class="brand-kpi-card__body py-3">
                <div class="brand-kpi-card__label">{{ kpi.label }}</div>
                <div class="brand-kpi-card__value text-h5">{{ kpi.value }}</div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <UserUsageInsightPanel
          v-if="usageInsight"
          :insight="usageInsight"
          :raw="insightRawCounts"
          :top-model="user?.topModel ?? ''"
          :coaching-hints="coachingHints"
        />

        <v-row v-if="billingAvailable || !premiumCreditsFetchEnabled || premiumCreditsTableDisabled || aiCreditsFetchEnabled" class="mb-4" dense>
          <v-col v-if="aiCreditsFetchEnabled" cols="12" md="6">
            <v-card variant="outlined" class="pa-3">
              <div class="text-subtitle-2 mb-2 d-flex align-center ga-2">
                {{ t('userDetail.aiCreditsPeriod') }}
              </div>
              <BrandAiCreditsCell
                v-if="user.ai_credits && user.ai_credits.source !== 'unavailable'"
                :credits="user.ai_credits"
              />
              <span v-else-if="!billingAvailable" class="brand-credits-cell--na">{{ t('common.na') }}</span>
              <BrandAiCreditsCell v-else :credits="user.ai_credits" />
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-3">
              <div class="text-subtitle-2 mb-2 d-flex align-center ga-2">
                {{ t('userDetail.premiumCredits') }}
              </div>
              <BrandPremiumCreditsCell
                :credits="user.premium_credits"
                :coming-soon="!premiumCreditsFetchEnabled && !premiumCreditsTableDisabled"
                :disabled="premiumCreditsTableDisabled"
              />
            </v-card>
          </v-col>
          <v-col
            v-if="!premiumCreditsTableDisabled && premiumCreditsFetchEnabled && user.pruNetAmount != null"
            cols="12"
            md="6"
          >
            <v-card variant="outlined" class="pa-3">
              <div class="text-subtitle-2 mb-1">{{ t('userDetail.pruCost') }}</div>
              <div class="text-h5">{{ formatCurrency(user.pruNetAmount) }}</div>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="teamSlugs.length" class="mb-4">
          <v-col cols="12">
            <div class="text-subtitle-2 mb-2">{{ t('userDetail.teamsSnapshot') }}</div>
            <v-chip-group>
              <v-chip v-for="slug in teamSlugs" :key="slug" size="small" class="brand-filter-chip">
                {{ slug }}
              </v-chip>
            </v-chip-group>
          </v-col>
        </v-row>

        <v-row class="mb-2">
          <v-col cols="12" sm="6" md="4">
            <v-chip
              size="small"
              variant="flat"
              class="brand-status-chip mr-2"
              :class="user.used_agent ? 'brand-status-chip--yes' : 'brand-status-chip--no'"
            >
              {{ t('userDetail.agent') }} {{ user.used_agent ? t('common.yes') : t('common.no') }}
            </v-chip>
            <v-chip
              size="small"
              variant="flat"
              class="brand-status-chip mr-2"
              :class="user.used_chat ? 'brand-status-chip--yes' : 'brand-status-chip--no'"
            >
              {{ t('userDetail.chat') }} {{ user.used_chat ? t('common.yes') : t('common.no') }}
            </v-chip>
            <v-chip
              v-if="user.used_cli"
              size="small"
              variant="flat"
              class="brand-status-chip brand-status-chip--yes"
            >
              {{ t('userDetail.cli') }}
            </v-chip>
            <v-chip
              size="small"
              variant="flat"
              class="brand-status-chip mr-2"
              :class="user.used_coding_agent ? 'brand-status-chip--yes' : 'brand-status-chip--no'"
            >
              {{ t('userDetail.codingAgent') }} {{ user.used_coding_agent ? t('common.yes') : t('common.no') }}
            </v-chip>
          </v-col>
        </v-row>

        <BrandDismissibleAlert
          v-if="serverSideTelemetryOnly"
          type="info"
          density="compact"
          wrapper-class="mb-4"
          alert-class="brand-alert brand-alert--info"
          :close-label="t('common.close')"
        >
          {{ t('userDetail.serverSideTelemetryHint') }}
        </BrandDismissibleAlert>

        <BrandDismissibleAlert
          v-if="!hasChartData && !serverSideTelemetryOnly"
          type="info"
          density="compact"
          alert-class="mb-4 brand-alert brand-alert--info"
          :close-label="t('common.close')"
        >
          {{ t('userDetail.noBreakdown') }}
        </BrandDismissibleAlert>

        <v-row v-else>
          <v-col cols="12" lg="7">
            <v-card>
              <v-card-title class="pb-0">
                <BrandChartTitle
                  :title="t('userDetail.chartTopModels')"
                  :tooltip="chartTooltips.userTopModels"
                  heading-tag="div"
                  heading-class="text-subtitle-1"
                />
              </v-card-title>
              <v-card-text>
                <div class="brand-chart-surface" style="height: 280px;">
                  <Bar v-if="modelChartData" :data="modelChartData" :options="barChartOptions" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" lg="5">
            <v-card>
              <v-card-title class="pb-0">
                <BrandChartTitle
                  :title="t('userDetail.chartActivityMix')"
                  :tooltip="chartTooltips.userActivityMix"
                  heading-tag="div"
                  heading-class="text-subtitle-1"
                />
              </v-card-title>
              <v-card-text>
                <div class="brand-chart-surface" style="height: 280px;">
                  <Bar v-if="activityChartData" :data="activityChartData" :options="barChartOptions" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" lg="6">
            <v-card>
              <v-card-title class="pb-0">
                <BrandChartTitle
                  :title="t('userDetail.chartFeatures')"
                  :tooltip="chartTooltips.userFeatures"
                  heading-tag="div"
                  heading-class="text-subtitle-1"
                />
              </v-card-title>
              <v-card-text>
                <div class="brand-chart-surface" style="height: 280px;">
                  <Pie v-if="featureChartData" :data="featureChartData" :options="pieChartOptions" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" lg="6">
            <v-card>
              <v-card-title class="pb-0">
                <BrandChartTitle
                  :title="t('userDetail.chartModelFeature')"
                  :tooltip="chartTooltips.userModelFeature"
                  heading-tag="div"
                  heading-class="text-subtitle-1"
                />
              </v-card-title>
              <v-card-text>
                <div class="brand-chart-surface" style="height: 280px;">
                  <Bar
                    v-if="modelFeatureChartData"
                    :data="modelFeatureChartData"
                    :options="horizontalBarOptions"
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import { Bar, Pie } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  ArcElement,
  Tooltip
} from 'chart.js'
import type { UserUsageLeaderboardRow } from '../../shared/types/usage-insights'
import { usageNumber } from '../../shared/types/copilot-usage'
import BrandPremiumCreditsCell from '@/components/BrandPremiumCreditsCell.vue'
import BrandAiCreditsCell from '@/components/BrandAiCreditsCell.vue'
import BrandUserAvatar from '@/components/BrandUserAvatar.vue'
import BrandAiAdoptionPhaseChip from '@/components/BrandAiAdoptionPhaseChip.vue'
import BrandDismissibleAlert from '@/components/BrandDismissibleAlert.vue'
import BrandChartTitle from '@/components/BrandChartTitle.vue'
import BrandKpiTooltip from '@/components/BrandKpiTooltip.vue'
import UserUsageInsightPanel from '@/components/UserUsageInsightPanel.vue'
import type { UserUsageInsight } from '../../shared/types/usage-pattern'
import { PREMIUM_CREDITS_TABLE_DISABLED } from '../../shared/utils/premium-credits-feature'
import { isServerSideTelemetryUser } from '../../shared/utils/ai-credits'
import { buildUsageCoachingHints } from '../../shared/utils/usage-coaching-hints'
import { useChartTooltips } from '@/utils/chart-tooltips'
import { pieSliceColors } from '@/utils/brand-colors'
import {
  brandBarChartOptions,
  brandChartOptionsInContainer,
  brandPieChartOptions,
  paletteEntry
} from '@/utils/chart-theme'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

function formatFeatureLabel(feature?: string): string {
  return (feature || '')
    .replace('chat_panel_', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default defineComponent({
  name: 'UserUsageDetailDialog',
  components: {
    Bar,
    Pie,
    BrandPremiumCreditsCell,
    BrandAiCreditsCell,
    BrandUserAvatar,
    BrandAiAdoptionPhaseChip,
    BrandDismissibleAlert,
    BrandChartTitle,
    BrandKpiTooltip,
    UserUsageInsightPanel
  },
  props: {
    modelValue: { type: Boolean, required: true },
    user: {
      type: Object as PropType<UserUsageLeaderboardRow | null>,
      default: null
    },
    usageInsight: {
      type: Object as PropType<UserUsageInsight | null>,
      default: null
    },
    reportRange: { type: String, default: '' },
    billingAvailable: { type: Boolean, default: false },
    premiumCreditsFetchEnabled: { type: Boolean, default: true },
    aiCreditsFetchEnabled: { type: Boolean, default: true },
    teamSlugs: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const chartTooltips = useChartTooltips()
    const { t } = useAppI18n()
    const { visible: showAiAdoptionCohorts } = useAiAdoptionCohortsFeature()
    const barChartOptions = brandBarChartOptions(brandChartOptionsInContainer)
    const pieChartOptions = brandPieChartOptions(brandChartOptionsInContainer)
    const horizontalBarOptions = computed(() => ({
      ...brandBarChartOptions(brandChartOptionsInContainer),
      indexAxis: 'y' as const
    }))

    const formatNumber = (n: number) =>
      new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)

    const formatCurrency = (n: number) =>
      new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)

    const premiumCreditsTableDisabled = PREMIUM_CREDITS_TABLE_DISABLED

    const summaryKpis = computed(() => {
      const u = props.user
      if (!u) return []
      return [
        {
          label: t.value('userDetail.kpiInteractions'),
          value: formatNumber(u.interactions),
          tooltip: t.value('billing.kpiTooltipInteractions')
        },
        {
          label: t.value('userDetail.kpiGenerations'),
          value: formatNumber(u.generations),
          tooltip: t.value('billing.kpiTooltipGenerations')
        },
        {
          label: t.value('userDetail.kpiAcceptances'),
          value: formatNumber(u.acceptances),
          tooltip: t.value('billing.kpiTooltipAcceptances')
        },
        {
          label: t.value('userDetail.kpiLocAdded'),
          value: formatNumber(u.locAdded),
          tooltip: t.value('billing.kpiTooltipLocAdded')
        }
      ]
    })

    const insightRawCounts = computed(() => {
      const u = props.user
      if (!u) return null
      return {
        interactions: u.interactions,
        generations: u.generations,
        acceptances: u.acceptances,
        locAdded: u.locAdded
      }
    })

    const coachingHints = computed(() => {
      const u = props.user
      const insight = props.usageInsight
      if (!u) return []
      return buildUsageCoachingHints({
        interactions: u.interactions,
        generations: u.generations,
        acceptances: u.acceptances,
        totals_by_feature: u.totals_by_feature,
        totals_by_model_feature: u.totals_by_model_feature,
        ai_credits: u.ai_credits,
        used_agent: u.used_agent,
        used_chat: u.used_chat,
        engagementScore: insight?.engagementScore,
        acceptanceRate: insight?.rates.acceptanceRate
      })
    })

    const modelChartData = computed(() => {
      const rows = props.user?.totals_by_model_feature || []
      const byModel = new Map<string, number>()
      for (const row of rows) {
        const model = row.model || t.value('common.na')
        byModel.set(
          model,
          (byModel.get(model) || 0) + usageNumber(row.user_initiated_interaction_count)
        )
      }
      const sorted = [...byModel.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
      if (!sorted.length) return null
      return {
        labels: sorted.map(([m]) => m),
        datasets: [{
          label: t.value('userDetail.legendInteractions'),
          data: sorted.map(([, v]) => v),
          backgroundColor: sorted.map((_, i) => paletteEntry(i).bg),
          borderColor: sorted.map((_, i) => paletteEntry(i).border),
          borderWidth: 1,
          borderRadius: 6
        }]
      }
    })

    const featureChartData = computed(() => {
      const rows = (props.user?.totals_by_feature || [])
        .map((r) => ({
          feature: formatFeatureLabel(String(r.feature)),
          interactions: usageNumber(r.user_initiated_interaction_count)
        }))
        .filter((r) => r.interactions > 0)
        .sort((a, b) => b.interactions - a.interactions)
        .slice(0, 8)
      if (!rows.length) return null
      return {
        labels: rows.map((r) => r.feature),
        datasets: [{
          data: rows.map((r) => r.interactions),
          backgroundColor: pieSliceColors(rows.length),
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      }
    })

    const modelFeatureChartData = computed(() => {
      const rows = [...(props.user?.totals_by_model_feature || [])]
        .map((r) => ({
          label: `${r.model} · ${formatFeatureLabel(String(r.feature))}`,
          interactions: usageNumber(r.user_initiated_interaction_count)
        }))
        .filter((r) => r.interactions > 0)
        .sort((a, b) => b.interactions - a.interactions)
        .slice(0, 8)
      if (!rows.length) return null
      return {
        labels: rows.map((r) => r.label),
        datasets: [{
          label: t.value('userDetail.legendInteractions'),
          data: rows.map((r) => r.interactions),
          backgroundColor: rows.map((_, i) => paletteEntry(i).bg),
          borderColor: rows.map((_, i) => paletteEntry(i).border),
          borderWidth: 1,
          borderRadius: 4
        }]
      }
    })

    const activityChartData = computed(() => {
      const u = props.user
      if (!u) return null
      return {
        labels: [
          t.value('userDetail.activityInteractions'),
          t.value('userDetail.activityGenerations'),
          t.value('userDetail.activityAcceptances')
        ],
        datasets: [{
          label: t.value('userDetail.legendCount'),
          data: [u.interactions, u.generations, u.acceptances],
          backgroundColor: [paletteEntry(0).bg, paletteEntry(1).bg, paletteEntry(2).bg],
          borderColor: [paletteEntry(0).border, paletteEntry(1).border, paletteEntry(2).border],
          borderWidth: 1,
          borderRadius: 6
        }]
      }
    })

    const hasChartData = computed(
      () =>
        Boolean(modelChartData.value || featureChartData.value || modelFeatureChartData.value)
    )

    const serverSideTelemetryOnly = computed(() => {
      const u = props.user
      if (!u || hasChartData.value) return false
      return isServerSideTelemetryUser({
        user_initiated_interaction_count: u.interactions,
        code_generation_activity_count: u.generations,
        totals_by_feature: u.totals_by_feature,
        totals_by_model_feature: u.totals_by_model_feature
      })
    })

    return {
      chartTooltips,
      t,
      emit,
      showAiAdoptionCohorts,
      premiumCreditsTableDisabled,
      aiCreditsFetchEnabled: computed(() => props.aiCreditsFetchEnabled),
      summaryKpis,
      insightRawCounts,
      coachingHints,
      modelChartData,
      featureChartData,
      modelFeatureChartData,
      activityChartData,
      hasChartData,
      serverSideTelemetryOnly,
      barChartOptions,
      pieChartOptions,
      horizontalBarOptions,
      formatCurrency
    }
  }
})
</script>

<style scoped>
.user-usage-detail {
  background: #ffffff !important;
}

.user-usage-detail__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-top: 20px;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 2;
}

.user-usage-detail__body {
  padding-top: 16px;
  background: #ffffff;
}

.user-usage-detail :deep(.v-card:not(.brand-kpi-card)) {
  background: #ffffff !important;
}

.user-usage-detail .brand-kpi-card__value.text-h5 {
  font-size: 1.35rem !important;
}
</style>
