<template>
  <div v-if="hasData" class="brand-adoption-panel mb-4">
    <BrandChartTitle
      :title="t('adoption.panelTitle')"
      :tooltip="panelTooltip"
      heading-class="mb-3"
    />

    <v-row class="brand-adoption-kpi-row mb-2" dense align="stretch">
      <v-col
        v-for="row in kpiPhases"
        :key="row.phase"
        cols="12"
        :sm="kpiColSpan"
        :md="kpiColSpan"
        class="d-flex"
      >
        <v-card
          variant="flat"
          :class="['brand-kpi-card brand-adoption-kpi-card flex-grow-1 w-100', phaseCardClass(row.phase)]"
        >
          <div class="brand-kpi-card__body brand-adoption-kpi-card__body">
            <div class="brand-adoption-kpi-card__head">
              <h3 class="brand-adoption-kpi-card__title">{{ phaseTitle(row.phase) }}</h3>
              <BrandInfoTooltip
                :text="phaseHint(row.phase)"
                :aria-label="phaseTitle(row.phase)"
                location="bottom end"
              />
            </div>

            <template v-if="showDualMetrics">
              <div class="brand-adoption-kpi-card__metrics">
                <div class="brand-adoption-kpi-card__metric">
                  <span class="brand-adoption-kpi-card__metric-value">{{ formatCount(row.engagedUsers) }}</span>
                  <span class="brand-adoption-kpi-card__metric-label">{{ t('adoption.engagedUsersCohort') }}</span>
                </div>
                <div class="brand-adoption-kpi-card__metric-divider" aria-hidden="true" />
                <div class="brand-adoption-kpi-card__metric">
                  <span class="brand-adoption-kpi-card__metric-value">{{ formatCount(row.labeledUsers ?? 0) }}</span>
                  <span class="brand-adoption-kpi-card__metric-label">{{ t('adoption.labeledInReport') }}</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="brand-adoption-kpi-card__metrics brand-adoption-kpi-card__metrics--single">
                <div class="brand-adoption-kpi-card__metric">
                  <span class="brand-adoption-kpi-card__metric-value">{{ formatCount(row.engagedUsers) }}</span>
                  <span class="brand-adoption-kpi-card__metric-label">{{ t('adoption.engagedUsers') }}</span>
                </div>
              </div>
            </template>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="5">
        <v-card>
          <v-card-title class="text-subtitle-1 pb-0">{{ t('adoption.chartUsersByPhase') }}</v-card-title>
          <v-card-text>
            <div class="brand-chart-surface" style="height: 260px;">
              <Bar v-if="usersChartData" :data="usersChartData" :options="barChartOptions" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="7">
        <BrandTableShell
          :title="t('adoption.tableTitle')"
          :subtitle="t('adoption.tableSubtitle')"
        >
          <v-data-table
            :headers="tableHeaders"
            :items="displayPhases"
            density="comfortable"
            class="brand-data-table"
            :items-per-page="-1"
            hide-default-footer
          >
            <template #item.phase="{ item }">
              <BrandAiAdoptionPhaseChip :phase-id="item.phase" />
            </template>
            <template #item.engagedUsers="{ item }">
              <span class="brand-table-metric">{{ formatCount(item.engagedUsers) }}</span>
            </template>
            <template #item.labeledUsers="{ item }">
              <span class="brand-table-metric">{{ formatCount(item.labeledUsers ?? 0) }}</span>
            </template>
            <template #item.avgInteractions="{ item }">
              <span class="brand-table-metric">{{ formatAvg(item.avgInteractions) }}</span>
            </template>
            <template #item.avgGenerations="{ item }">
              <span class="brand-table-metric">{{ formatAvg(item.avgGenerations) }}</span>
            </template>
            <template #item.avgAcceptances="{ item }">
              <span class="brand-table-metric">{{ formatAvg(item.avgAcceptances) }}</span>
            </template>
            <template #item.avgLocAdded="{ item }">
              <span class="brand-table-metric">{{ formatAvg(item.avgLocAdded) }}</span>
            </template>
            <template #item.avgLocDeleted="{ item }">
              <span class="brand-table-metric">{{ formatAvg(item.avgLocDeleted) }}</span>
            </template>
            <template #item.avgPrCreated="{ item }">
              <span class="brand-table-metric">{{ formatAvg(item.avgPrCreated) }}</span>
            </template>
            <template #item.avgPrMerged="{ item }">
              <span class="brand-table-metric">{{ formatAvg(item.avgPrMerged) }}</span>
            </template>
            <template #item.avgPrReviewed="{ item }">
              <span class="brand-table-metric">{{ formatAvg(item.avgPrReviewed) }}</span>
            </template>
            <template #item.medianMinutesToMerge="{ item }">
              <span class="brand-table-metric">{{ formatAvg(item.medianMinutesToMerge) }}</span>
            </template>
          </v-data-table>
        </BrandTableShell>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js'
import type { AiAdoptionPhaseAggregate, AiAdoptionPhaseId } from '../../shared/types/copilot-usage'
import BrandAiAdoptionPhaseChip from '@/components/BrandAiAdoptionPhaseChip.vue'
import BrandInfoTooltip from '@/components/BrandInfoTooltip.vue'
import BrandTableShell from '@/components/BrandTableShell.vue'
import { pieSliceColors } from '@/utils/brand-colors'
import {
  brandBarChartOptions,
  brandChartOptionsInContainer
} from '@/utils/chart-theme'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type PhaseHintKey =
  | 'adoption.phase0Hint'
  | 'adoption.phase1Hint'
  | 'adoption.phase2Hint'
  | 'adoption.phase3Hint'

export default defineComponent({
  name: 'BrandAiAdoptionPanel',
  components: { Bar, BrandAiAdoptionPhaseChip, BrandInfoTooltip, BrandTableShell },
  props: {
    phases: {
      type: Array as PropType<AiAdoptionPhaseAggregate[]>,
      default: () => []
    }
  },
  setup(props) {
    const { t } = useAppI18n()
    const { ideOnly, filterPhases, phaseOrder } = useAdoptionIdeOnly()
    const barChartOptions = brandBarChartOptions(brandChartOptionsInContainer)

    const displayPhases = computed(() => filterPhases(props.phases))

    const showDualMetrics = computed(() =>
      displayPhases.value.some((row) => row.labeledUsers !== undefined)
    )

    const panelTooltip = computed(() => {
      if (ideOnly.value) {
        return showDualMetrics.value
          ? t.value('adoption.panelTooltipDualIdeOnly')
          : t.value('adoption.panelTooltipIdeOnly')
      }
      return showDualMetrics.value
        ? t.value('adoption.panelTooltipDual')
        : t.value('adoption.panelTooltip')
    })

    const hasData = computed(() =>
      displayPhases.value.some(
        (row) => row.engagedUsers > 0 || (row.labeledUsers ?? 0) > 0
      )
    )

    const kpiPhases = computed(() => {
      const byPhase = new Map(displayPhases.value.map((row) => [row.phase, row]))
      return phaseOrder.value.map((phase) => byPhase.get(phase)).filter(
        (row): row is AiAdoptionPhaseAggregate =>
          row != null &&
          (row.engagedUsers > 0 || (row.labeledUsers ?? 0) > 0 || row.phase === 0)
      )
    })

    /** 12-column grid span so visible cohort cards fill the full row. */
    const kpiColSpan = computed(() => {
      const n = Math.max(kpiPhases.value.length, 1)
      return Math.floor(12 / n)
    })

    const phaseTitle = (phase: AiAdoptionPhaseId) =>
      t.value(`adoption.phase${phase}Title` as 'adoption.phase0Title')

    const phaseHint = (phase: AiAdoptionPhaseId) => {
      if (ideOnly.value && phase === 1) {
        return t.value('adoption.phase1HintIdeOnly')
      }
      return t.value(`adoption.phase${phase}Hint` as PhaseHintKey)
    }

    const phaseCardClass = (phase: AiAdoptionPhaseId) => {
      switch (phase) {
        case 1:
          return 'brand-metric-card--purple'
        case 2:
          return 'brand-metric-card--turquoise'
        case 3:
          return 'brand-metric-card--accent'
        default:
          return 'brand-metric-card--lavender'
      }
    }

    const formatCount = (n: number) => Math.round(n).toLocaleString()
    const formatAvg = (n: number) =>
      n > 0 ? n.toLocaleString(undefined, { maximumFractionDigits: 1 }) : t.value('common.emDash')

    const usersChartData = computed(() => {
      const rows = kpiPhases.value
      if (!rows.length) return null

      const labels = rows.map((row) => phaseTitle(row.phase))
      const colors = pieSliceColors(rows.length)

      if (showDualMetrics.value) {
        return {
          labels,
          datasets: [
            {
              label: t.value('adoption.chartCohortEngaged'),
              data: rows.map((row) => row.engagedUsers),
              backgroundColor: colors.map((c) => c),
              borderRadius: 6
            },
            {
              label: t.value('adoption.chartLabeledInReport'),
              data: rows.map((row) => row.labeledUsers ?? 0),
              backgroundColor: colors.map((c) => `${c}99`),
              borderRadius: 6
            }
          ]
        }
      }

      return {
        labels,
        datasets: [{
          label: t.value('adoption.engagedUsers'),
          data: rows.map((row) => row.engagedUsers),
          backgroundColor: colors,
          borderRadius: 6
        }]
      }
    })

    const tableHeaders = computed(() => {
      const headers = [
        { title: t.value('adoption.colPhase'), key: 'phase', sortable: false },
        {
          title: showDualMetrics.value
            ? t.value('adoption.engagedUsersCohort')
            : t.value('adoption.colEngagedUsers'),
          key: 'engagedUsers',
          align: 'end' as const
        }
      ]
      if (showDualMetrics.value) {
        headers.push({
          title: t.value('adoption.colLabeledUsers'),
          key: 'labeledUsers',
          align: 'end' as const
        })
      }
      headers.push(
        { title: t.value('adoption.colAvgInteractions'), key: 'avgInteractions', align: 'end' as const },
        { title: t.value('adoption.colAvgGenerations'), key: 'avgGenerations', align: 'end' as const },
        { title: t.value('adoption.colAvgAcceptances'), key: 'avgAcceptances', align: 'end' as const },
        { title: t.value('adoption.colAvgLocAdded'), key: 'avgLocAdded', align: 'end' as const },
        { title: t.value('adoption.colAvgLocDeleted'), key: 'avgLocDeleted', align: 'end' as const },
        { title: t.value('adoption.colAvgPrCreated'), key: 'avgPrCreated', align: 'end' as const },
        { title: t.value('adoption.colAvgPrMerged'), key: 'avgPrMerged', align: 'end' as const },
        { title: t.value('adoption.colAvgPrReviewed'), key: 'avgPrReviewed', align: 'end' as const },
        {
          title: t.value('adoption.colMedianMinutesToMerge'),
          key: 'medianMinutesToMerge',
          align: 'end' as const
        }
      )
      return headers
    })

    return {
      t,
      displayPhases,
      barChartOptions,
      panelTooltip,
      hasData,
      showDualMetrics,
      kpiPhases,
      kpiColSpan,
      phaseTitle,
      phaseHint,
      phaseCardClass,
      formatCount,
      formatAvg,
      usersChartData,
      tableHeaders
    }
  }
})
</script>

<style scoped>
.brand-adoption-kpi-row {
  width: 100%;
  align-items: stretch;
}

.brand-adoption-kpi-row > :deep(.v-col) {
  display: flex;
}

.brand-adoption-kpi-card {
  display: flex;
  flex-direction: column;
  max-width: none !important;
}

.brand-adoption-kpi-card__body {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  min-height: 140px;
  height: 100%;
  padding: 22px 24px !important;
  box-sizing: border-box;
}

.brand-adoption-kpi-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.brand-adoption-kpi-card__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--brand-text);
  letter-spacing: -0.01em;
}

.brand-adoption-kpi-card__metrics {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-around;
  gap: 16px 20px;
  width: 100%;
  margin-top: auto;
}

.brand-adoption-kpi-card__metrics--single {
  justify-content: flex-start;
}

.brand-adoption-kpi-card__metric {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;
}

.brand-adoption-kpi-card__metric-divider {
  flex: 0 0 1px;
  align-self: stretch;
  width: 1px;
  min-height: 48px;
  background: color-mix(in srgb, var(--brand-text) 14%, transparent);
}

.brand-adoption-kpi-card__metric-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--brand-text);
}

.brand-adoption-kpi-card__metric-label {
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.35;
  color: #5c5c6a;
  text-transform: none;
  letter-spacing: normal;
}

@media (max-width: 600px) {
  .brand-adoption-kpi-card__metrics {
    flex-direction: column;
    gap: 16px;
  }

  .brand-adoption-kpi-card__metric-divider {
    width: 100%;
    height: 1px;
    min-height: 0;
    align-self: center;
  }

  .brand-adoption-kpi-card__metric {
    align-items: center;
    text-align: center;
  }
}
</style>
