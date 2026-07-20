<template>
  <div>
    <section class="brand-page-panel">
        <BrandPageSkeleton
          v-if="loading"
          layout="billing"
          :aria-label="t('billing.loading')"
        />

        <div v-else-if="error">
          <BrandDismissibleAlert
            type="error"
            variant="outlined"
            alert-class="brand-alert brand-alert--error"
            wrapper-class="mb-4"
            :close-label="t('common.close')"
            :title="t('billing.errorTitle')"
          >
            {{ error }}
          </BrandDismissibleAlert>
        </div>

        <div v-else-if="insights">
          <h2 class="mb-2">{{ t('billing.title') }}</h2>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ t('billing.subtitle') }}
          </p>

          <BrandDismissibleAlert
            v-if="usageNarrowerThanBilling"
            storage-key="billing-span-note"
            :close-label="t('common.close')"
            :title="t('billing.billingSpanNoteTitle')"
            density="comfortable"
            wrapper-class="mb-4"
            alert-class="brand-alert brand-alert--info"
          >
            {{
              t('billing.billingSpanNoteBody', {
                billingRange: billingRangeLabel,
                usageRange: usageReportRangeLabel,
              })
            }}
          </BrandDismissibleAlert>

          <BrandDismissibleAlert
            v-if="filteredView.billing.available && dateRange.since && dateRange.until"
            storage-key="billing-range-note"
            :close-label="t('common.close')"
            density="comfortable"
            wrapper-class="mb-4"
            alert-class="brand-alert brand-alert--info"
          >
            {{ t('billing.billingRangeNoteBody', {
              since: dateRange.since,
              until: dateRange.until,
            }) }}
          </BrandDismissibleAlert>

          <BrandDismissibleAlert
            v-if="usageNarrowerThanBilling"
            type="warning"
            storage-key="billing-usage-partial-window"
            :close-label="t('common.close')"
            density="comfortable"
            wrapper-class="mb-4"
            alert-class="brand-alert brand-alert--warning"
          >
            {{ t('billing.usagePartialWindowBody', {
              usageRange: usageReportRangeLabel,
              billingRange: billingRangeLabel,
            }) }}
          </BrandDismissibleAlert>

          <BrandCollapsibleBillingAlert
            v-if="!filteredView.billing.available"
            storage-key="billing-api-not-loaded"
            :close-label="t('common.close')"
            :title="t('billing.billingNotLoadedTitle')"
            :summary="billingAlertSummaryText"
            variant="info"
          >
            <p class="mb-2">
              {{ filteredView.billing.reason || t('billing.billingNotLoadedSummary') }}
            </p>
            <p class="mb-0">
              {{ t('billing.billingNotLoadedDetail') }}
            </p>
          </BrandCollapsibleBillingAlert>

          <v-row class="mb-4">
            <v-col v-for="kpi in usageKpiCards" :key="kpi.label" cols="6" sm="4" md="3" lg="2">
              <v-card variant="flat" :class="['brand-kpi-card', 'brand-metric-kpi', kpi.cardClass]">
                <BrandKpiTooltip :text="kpi.tooltip" />
                <div class="brand-kpi-card__body">
                  <div class="brand-kpi-card__label">{{ kpi.label }}</div>
                  <div class="brand-kpi-card__value">{{ kpi.value }}</div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-if="costKpiCards.length" class="mb-4">
            <v-col
              v-for="card in costKpiCards"
              :key="card.label"
              cols="12"
              sm="6"
            >
              <v-card
                variant="flat"
                :ripple="false"
                :class="[
                  'brand-kpi-card',
                  'brand-metric-kpi',
                  card.cardClass,
                  card.opensSkuDetail && 'brand-kpi-card--interactive'
                ]"
                :role="card.opensSkuDetail ? 'button' : undefined"
                :tabindex="card.opensSkuDetail ? 0 : undefined"
                :aria-label="card.opensSkuDetail ? t('billing.kpiNetSpendOpenDetail') : undefined"
                @click="card.opensSkuDetail ? openSkuDetail() : undefined"
                @keydown.enter.prevent="card.opensSkuDetail ? openSkuDetail() : undefined"
                @keydown.space.prevent="card.opensSkuDetail ? openSkuDetail() : undefined"
              >
                <BrandKpiTooltip :text="card.tooltip" />
                <div class="brand-kpi-card__body">
                  <div class="brand-kpi-card__label">{{ card.label }}</div>
                  <div class="brand-kpi-card__value">{{ card.value }}</div>
                  <div v-if="card.hint" class="brand-kpi-card__hint">
                    {{ card.hint }}
                    <span v-if="card.opensSkuDetail" class="billing-kpi-open-detail">
                      · {{ t('billing.kpiNetSpendViewDetail') }}
                    </span>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mb-4">
            <v-col v-for="kpi in agentChatKpiCards" :key="kpi.label" cols="6">
              <v-card variant="flat" :class="['brand-kpi-card', 'brand-metric-kpi', kpi.cardClass]">
                <BrandKpiTooltip :text="kpi.tooltip" />
                <div class="brand-kpi-card__body">
                  <div class="brand-kpi-card__label">{{ kpi.label }}</div>
                  <div class="brand-kpi-card__value">{{ kpi.value }}</div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <BrandMonthlySeatInvoiceSection
            v-if="seats.length"
            :seats="seats"
            use-billing-title
            :show-historical-hint="false"
          />

          <v-row v-if="filteredView.billing.available" class="mb-4">
            <v-col cols="6" sm="4" md="3">
              <v-card variant="flat" class="brand-kpi-card brand-metric-kpi brand-metric-card--lavender">
                <BrandKpiTooltip :text="t('billing.kpiTooltipModelsBilled')" />
                <div class="brand-kpi-card__body">
                  <div class="brand-kpi-card__label">{{ t('billing.kpiModelsBilled') }}</div>
                  <div class="brand-kpi-card__value">{{ filteredView.premiumByModel.length }}</div>
                  <div class="brand-kpi-card__hint">{{ t('billing.kpiHintDistinct') }}</div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mb-4">
            <v-col cols="12" lg="7">
              <v-card>
                <v-card-title class="pb-0">
                  <BrandChartTitle
                    :title="t('billing.chartTopModels')"
                    :tooltip="chartTooltips.billingTopModels"
                    heading-tag="div"
                    heading-class="text-h6"
                  />
                </v-card-title>
                <v-card-text>
                  <div class="brand-chart-surface" style="height: 320px;">
                    <Bar v-if="modelChartData" :data="modelChartData" :options="barChartOptions" />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" lg="5">
              <v-card>
                <v-card-title class="pb-0">
                  <BrandChartTitle
                    :title="t('billing.chartFeatureAdoption')"
                    :tooltip="chartTooltips.billingFeatureAdoption"
                    heading-tag="div"
                    heading-class="text-h6"
                  />
                </v-card-title>
                <v-card-text>
                  <div class="brand-chart-surface" style="height: 320px;">
                    <Pie v-if="featureChartData" :data="featureChartData" :options="pieChartOptions" />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-if="filteredView.billing.available && filteredView.skuCosts.length" class="mb-4">
            <v-col cols="12" lg="6">
              <v-card>
                <v-card-title class="pb-0">
                  <BrandChartTitle
                    :title="t('billing.chartCostBySku')"
                    :tooltip="chartTooltips.billingCostBySku"
                    heading-tag="div"
                    heading-class="text-h6"
                  />
                </v-card-title>
                <v-card-text>
                  <div class="brand-chart-surface" style="height: 300px;">
                    <Bar :data="skuChartData" :options="barChartOptions" />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col v-if="premiumCreditsFetchEnabled" cols="12" lg="6">
              <v-card>
                <v-card-title class="pb-0">
                  <BrandChartTitle
                    :title="t('billing.chartPremiumByModel')"
                    :tooltip="chartTooltips.billingPremiumByModel"
                    heading-tag="div"
                    heading-class="text-h6"
                  />
                </v-card-title>
                <v-card-text>
                  <div class="brand-chart-surface" style="height: 300px;">
                    <Bar :data="premiumModelChartData" :options="barChartOptions" />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-if="filteredView.teamUsage.length" class="mb-4">
            <v-col cols="12">
              <v-card>
                <v-card-title class="pb-0">
                  <BrandChartTitle
                    :title="t('billing.chartTeamUsage')"
                    :tooltip="chartTooltips.billingTeamUsage"
                    heading-tag="div"
                    heading-class="text-h6"
                  />
                </v-card-title>
                <v-card-text>
                  <div class="brand-chart-surface" style="height: 280px;">
                    <Bar :data="teamChartData" :options="barChartOptions" />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <BillingSkuDetailDialog
            v-model="skuDetailDialogOpen"
            :sku-costs="filteredView.skuCosts"
            :total-net-spend="totalNetSpend"
            :report-range="detailReportRange"
          />

          <v-card flat class="pa-3 brand-info-banner">
            <div class="text-caption">
              <strong>{{ t('billing.dataSources') }}</strong>
              {{ t('billing.dataSourcesMetrics') }}
              <template v-if="filteredView.billing.available">{{ t('billing.dataSourcesBillingEndpoints') }}</template>
              <template v-else>{{ t('billing.dataSourcesNoBilling') }}</template>
              {{ t('billing.usersAnalysisHint') }}
            </div>
          </v-card>
        </div>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, ref, toRef, watch } from 'vue'
import BrandDismissibleAlert from '@/components/BrandDismissibleAlert.vue'
import BrandCollapsibleBillingAlert from '@/components/BrandCollapsibleBillingAlert.vue'
import BillingSkuDetailDialog from '@/components/BillingSkuDetailDialog.vue'
import { billingAlertSummary } from '../../shared/utils/billing-alert'
import { isCopilotBillingSku } from '../../shared/utils/billing-normalize'
import { useMonthlySeatInvoice } from '@/composables/useMonthlySeatInvoice'
import { useTabBillingRange, useTabReportRange } from '@/composables/useTabReportRange'
import { Bar, Pie } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  ArcElement
} from 'chart.js'
import type { UsageInsightsResponse } from '../../shared/types/usage-insights'
import { pieSliceColors } from '@/utils/brand-colors'
import {
  brandBarChartOptions,
  brandChartOptionsInContainer,
  brandPieChartOptions,
  paletteEntry
} from '@/utils/chart-theme'
import { Options } from '@/model/Options'
import { useRoute } from 'vue-router'
import BrandPageSkeleton from '@/components/BrandPageSkeleton.vue'
import BrandMonthlySeatInvoiceSection from '@/components/BrandMonthlySeatInvoiceSection.vue'
import type { Seat } from '@/model/Seat'
import { useChartTooltips } from '@/utils/chart-tooltips'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default defineComponent({
  name: 'UsageBillingViewer',
  components: {
    Bar,
    Pie,
    BrandDismissibleAlert,
    BrandCollapsibleBillingAlert,
    BillingSkuDetailDialog,
    BrandPageSkeleton,
    BrandMonthlySeatInvoiceSection
  },
  props: {
    dateRange: {
      type: Object as () => { since?: string; until?: string },
      default: () => ({})
    },
    dateRangeDescription: {
      type: String,
      default: ''
    },
    seats: {
      type: Array as () => Seat[],
      default: () => []
    }
  },
  setup(props) {
    const chartTooltips = useChartTooltips()
    const { t } = useAppI18n()
    const tabReportRange = useTabReportRange()
    const tabBillingRange = useTabBillingRange()
    const route = useRoute()
    const seatsRef = toRef(props, 'seats')
    const { monthlyTotals, seatUnitPrice } = useMonthlySeatInvoice(seatsRef)
    const loading = ref(true)
    const error = ref<string | null>(null)
    const insights = ref<UsageInsightsResponse | null>(null)
    const skuDetailDialogOpen = ref(false)

    const barChartOptions = brandBarChartOptions(brandChartOptionsInContainer)
    const pieChartOptions = brandPieChartOptions(brandChartOptionsInContainer)

    const formatNumber = (n: number) =>
      new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n)

    const formatCurrency = (n: number) =>
      new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)

    const formatFeature = (feature?: string) =>
      (feature || '')
        .replace('chat_panel_', '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())

    const load = async () => {
      loading.value = true
      error.value = null
      try {
        const options = Options.fromRoute(
          route,
          props.dateRange.since,
          props.dateRange.until
        )
        const params = options.toParams()
        insights.value = await $fetch<UsageInsightsResponse>('/api/usage-insights', { params })
      } catch (err: unknown) {
        error.value = err instanceof Error ? err.message : t.value('billing.errorLoad')
      } finally {
        loading.value = false
      }
    }

    watch(
      () => [props.dateRange.since, props.dateRange.until],
      () => {
        if (props.dateRange.since && props.dateRange.until) {
          load()
        }
      }
    )

    load()

    const filteredView = computed((): UsageInsightsResponse => {
      if (!insights.value) {
        return {
          summary: {
            userCount: 0,
            totalInteractions: 0,
            totalGenerations: 0,
            totalAcceptances: 0,
            totalLocAdded: 0,
            totalLocDeleted: 0,
            totalLocChanged: 0,
            uniqueModels: 0,
            agentUsers: 0,
            chatUsers: 0,
            cliUsers: 0
          },
          users: [],
          modelUsage: [],
          featureAdoption: [],
          teamUsage: [],
          billing: {
            available: false,
            reason: '',
            detailedUsage: [],
            summaryUsage: [],
            premiumRequestUsage: []
          },
          skuCosts: [],
          premiumByModel: [],
          premiumByUser: [],
          userTeams: [],
          adoptionByPhase: []
        }
      }
      return insights.value
    })

    const usageReportRangeLabel = computed(() => {
      const view = filteredView.value
      if (!view?.reportStartDay || !view?.reportEndDay) return ''
      return `${view.reportStartDay} → ${view.reportEndDay}`
    })

    const billingRangeLabel = computed(() => {
      if (!filteredView.value?.billing.available) return ''
      if (props.dateRange.since && props.dateRange.until) {
        return `${props.dateRange.since} → ${props.dateRange.until}`
      }
      if (insights.value?.since && insights.value?.until) {
        return `${insights.value.since} → ${insights.value.until}`
      }
      return ''
    })

    const usageNarrowerThanBilling = computed(() => {
      const usage = usageReportRangeLabel.value
      const billing = billingRangeLabel.value
      if (!usage || !billing || usage === billing) return false
      const { since, until } = props.dateRange
      if (!since || !until) return false
      const view = filteredView.value
      if (!view?.reportStartDay || !view?.reportEndDay) return false
      return view.reportStartDay > since || view.reportEndDay < until
    })

    watch(
      usageReportRangeLabel,
      (value) => {
        tabReportRange.value = value || null
      },
      { immediate: true }
    )

    watch(
      billingRangeLabel,
      (value) => {
        tabBillingRange.value = value || null
      },
      { immediate: true }
    )

    onUnmounted(() => {
      tabReportRange.value = null
      tabBillingRange.value = null
    })

    const kpiCards = computed(() => {
      const s = filteredView.value?.summary
      if (!s) return []
      return [
        {
          label: t.value('billing.kpiActiveUsers'),
          value: formatNumber(s.userCount),
          cardClass: 'brand-metric-card--purple',
          tooltip: t.value('billing.kpiTooltipActiveUsers')
        },
        {
          label: t.value('billing.kpiInteractions'),
          value: formatNumber(s.totalInteractions),
          cardClass: 'brand-metric-card--turquoise',
          tooltip: t.value('billing.kpiTooltipInteractions')
        },
        {
          label: t.value('billing.kpiGenerations'),
          value: formatNumber(s.totalGenerations),
          cardClass: 'brand-metric-card--purple',
          tooltip: t.value('billing.kpiTooltipGenerations')
        },
        {
          label: t.value('billing.kpiAcceptances'),
          value: formatNumber(s.totalAcceptances),
          cardClass: 'brand-metric-card--turquoise',
          tooltip: t.value('billing.kpiTooltipAcceptances')
        },
        {
          label: t.value('billing.kpiLocChanged'),
          value: formatNumber(s.totalLocChanged),
          cardClass: 'brand-metric-card--purple',
          tooltip: t.value('billing.kpiTooltipLocChanged', {
            added: formatNumber(s.totalLocAdded),
            deleted: formatNumber(s.totalLocDeleted)
          })
        },
        {
          label: t.value('billing.kpiModelsUsed'),
          value: String(s.uniqueModels),
          cardClass: 'brand-metric-card--turquoise',
          tooltip: t.value('billing.kpiTooltipModelsUsed')
        },
        {
          label: t.value('billing.kpiAgentUsers'),
          value: String(s.agentUsers),
          cardClass: 'brand-metric-card--purple',
          tooltip: t.value('billing.kpiTooltipAgentUsers')
        },
        {
          label: t.value('billing.kpiChatUsers'),
          value: String(s.chatUsers),
          cardClass: 'brand-metric-card--turquoise',
          tooltip: t.value('billing.kpiTooltipChatUsers')
        }
      ]
    })

    const agentChatKpiCards = computed(() =>
      kpiCards.value.filter(
        (kpi) =>
          kpi.label === t.value('billing.kpiAgentUsers') ||
          kpi.label === t.value('billing.kpiChatUsers')
      )
    )

    const usageKpiCards = computed(() =>
      kpiCards.value.filter(
        (kpi) =>
          kpi.label !== t.value('billing.kpiAgentUsers') &&
          kpi.label !== t.value('billing.kpiChatUsers')
      )
    )

    const skuHintLabel = (rows: Array<{ sku: string; netAmount: number }>, emptyHint: string) => {
      const byNet = [...rows].sort((a, b) => b.netAmount - a.netAmount)
      const withSpend = byNet.filter((row) => row.netAmount > 0)
      const named = (withSpend.length ? withSpend : byNet)
        .map((row) => row.sku)
        .filter(Boolean)
      if (!named.length) return emptyHint
      if (named.length === 1) return named[0]
      return t.value('billing.kpiSkuHintMultiple', {
        sku: named[0],
        count: named.length - 1
      })
    }

    const modelChartData = computed(() => {
      const rows = filteredView.value?.modelUsage || []
      const byModel = new Map<string, number>()
      for (const row of rows) {
        byModel.set(row.model, (byModel.get(row.model) || 0) + row.interactions)
      }
      const sorted = [...byModel.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
      if (!sorted.length) return null
      return {
        labels: sorted.map(([m]) => m),
        datasets: [{
          label: t.value('billing.legendInteractions'),
          data: sorted.map(([, v]) => v),
          backgroundColor: sorted.map((_, i) => paletteEntry(i).bg),
          borderColor: sorted.map((_, i) => paletteEntry(i).border),
          borderWidth: 1,
          borderRadius: 6
        }]
      }
    })

    const featureChartData = computed(() => {
      const rows = (filteredView.value?.featureAdoption || []).slice(0, 8)
      if (!rows.length) return null
      return {
        labels: rows.map((r) => formatFeature(r.feature)),
        datasets: [{
          data: rows.map((r) => r.interactions),
          backgroundColor: pieSliceColors(rows.length),
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      }
    })

    const skuChartData = computed(() => {
      const rows = (filteredView.value?.skuCosts || []).slice(0, 10)
      return {
        labels: rows.map((r) => r.sku),
        datasets: [{
          label: t.value('billing.legendNetUsd'),
          data: rows.map((r) => r.netAmount),
          backgroundColor: paletteEntry(0).bg,
          borderColor: paletteEntry(0).border,
          borderWidth: 1,
          borderRadius: 6
        }]
      }
    })

    const premiumModelChartData = computed(() => {
      const rows = (filteredView.value?.premiumByModel || []).slice(0, 10)
      return {
        labels: rows.map((r) => r.model),
        datasets: [{
          label: t.value('billing.legendPru'),
          data: rows.map((r) => r.netQuantity),
          backgroundColor: paletteEntry(2).bg,
          borderColor: paletteEntry(2).border,
          borderWidth: 1,
          borderRadius: 6
        }]
      }
    })

    const teamChartData = computed(() => {
      const rows = (filteredView.value?.teamUsage || []).slice(0, 15)
      return {
        labels: rows.map((r) => r.teamSlug),
        datasets: [{
          label: t.value('billing.legendInteractions'),
          data: rows.map((r) => r.interactions),
          backgroundColor: paletteEntry(1).bg,
          borderColor: paletteEntry(1).border,
          borderWidth: 1,
          borderRadius: 6
        }]
      }
    })

    const totalNetSpend = computed(() =>
      (filteredView.value?.skuCosts || []).reduce((s, r) => s + r.netAmount, 0)
    )

    /** Same estimate as Seat analysis: assigned seats × NUXT_PUBLIC_COPILOT_SEAT_UNIT_PRICE. */
    const seatInvoiceCost = computed(() => monthlyTotals.value?.monthly_cost ?? null)

    /** All Copilot Billing SKUs (Enterprise license + premium + AI credits, …). */
    const billingCopilotRows = computed(() =>
      (filteredView.value?.skuCosts || []).filter((row) => isCopilotBillingSku(row.sku))
    )

    const billingCopilotCost = computed(() =>
      billingCopilotRows.value.reduce((sum, row) => sum + row.netAmount, 0)
    )

    const costKpiCards = computed(() => {
      const cards: Array<{
        label: string
        value: string
        hint: string
        tooltip: string
        cardClass: string
        opensSkuDetail?: boolean
      }> = []

      if (seatInvoiceCost.value != null) {
        cards.push({
          label: t.value('billing.kpiSeatCost'),
          value: formatCurrency(seatInvoiceCost.value),
          hint: t.value('billing.kpiSeatCostHint', {
            price: formatCurrency(seatUnitPrice.value)
          }),
          tooltip: t.value('billing.kpiTooltipSeatCost'),
          cardClass: 'brand-metric-card--accent',
          opensSkuDetail: false
        })
      }

      if (filteredView.value?.billing.available) {
        cards.push({
          label: t.value('billing.kpiUsageCost'),
          value: formatCurrency(billingCopilotCost.value),
          hint: skuHintLabel(
            billingCopilotRows.value,
            t.value('billing.kpiCopilotEmptyHint')
          ),
          tooltip: t.value('billing.kpiTooltipUsageCost'),
          cardClass: 'brand-metric-card--purple',
          opensSkuDetail: filteredView.value.skuCosts.length > 0
        })
      }

      return cards
    })

    const detailReportRange = computed(() => {
      const view = filteredView.value
      if (view?.reportStartDay && view?.reportEndDay) {
        return `${view.reportStartDay} → ${view.reportEndDay}`
      }
      return props.dateRangeDescription
    })

    const openSkuDetail = () => {
      if (!(filteredView.value?.skuCosts.length)) return
      skuDetailDialogOpen.value = true
    }

    const billingAlertSummaryText = computed(() => {
      const billing = filteredView.value?.billing
      if (!billing) return ''
      return billingAlertSummary(billing)
    })

    return {
      chartTooltips,
      t,
      loading,
      error,
      insights,
      filteredView,
      kpiCards,
      usageKpiCards,
      agentChatKpiCards,
      costKpiCards,
      modelChartData,
      featureChartData,
      skuChartData,
      premiumModelChartData,
      teamChartData,
      barChartOptions,
      pieChartOptions,
      totalNetSpend,
      formatNumber,
      formatCurrency,
      formatFeature,
      billingAlertSummaryText,
      detailReportRange,
      usageReportRangeLabel,
      billingRangeLabel,
      usageNarrowerThanBilling,
      skuDetailDialogOpen,
      openSkuDetail
    }
  }
})
</script>

<style scoped>
.billing-kpi-open-detail {
  white-space: nowrap;
}
</style>
