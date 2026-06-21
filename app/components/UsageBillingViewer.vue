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
            v-if="!premiumCreditsFetchEnabled"
            storage-key="billing-premium-credits-coming-soon"
            :close-label="t('common.close')"
            :title="t('users.premiumCreditsComingSoonTitle')"
            density="comfortable"
            wrapper-class="mb-4"
          >
            <p class="mb-2">{{ t('users.premiumCreditsComingSoonBody') }}</p>
            <p class="mb-0 text-caption">{{ t('users.premiumCreditsComingSoonHint') }}</p>
          </BrandDismissibleAlert>

          <BrandDismissibleAlert
            v-if="profileCoverage.total > 0 && profileCoverage.withEmail === 0"
            type="warning"
            variant="outlined"
            storage-key="billing-email-unavailable"
            :close-label="t('common.close')"
            :title="t('billing.emailUnavailableTitle')"
            wrapper-class="mb-4"
            alert-class="brand-alert brand-alert--warning"
          >
            {{ t('billing.emailUnavailableBody') }}
          </BrandDismissibleAlert>

          <v-row class="mb-4">
            <v-col cols="12" md="6" lg="4">
              <v-autocomplete
                v-model="selectedUser"
                :items="userFilterOptions"
                :menu-props="brandSelectMenuProps"
                item-title="label"
                item-value="login"
                :label="t('billing.filterUser')"
                :placeholder="t('common.allUsers')"
                variant="outlined"
                density="compact"
                clearable
                prepend-inner-icon="mdi-account-filter"
                :hint="t('billing.filterHint')"
                persistent-hint
              />
            </v-col>
            <v-col v-if="selectedUser" cols="12" md="6" class="d-flex align-center">
              <v-chip class="ma-1 brand-filter-chip">
                {{ t('billing.showingUser', { user: selectedUser }) }}
              </v-chip>
              <v-chip
                v-if="filteredView && !filteredView.users.length"
                class="ma-1 brand-filter-chip brand-filter-chip--warning"
              >
                {{ t('billing.noUserData') }}
              </v-chip>
            </v-col>
          </v-row>

          <BrandAiAdoptionPanel
            v-if="showAiAdoptionCohorts && insights.adoptionByPhase?.length"
            :phases="insights.adoptionByPhase"
          />

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

          <v-row v-if="filteredView.billing.available" class="mb-4">
            <v-col
              v-for="card in billingHighlightCards"
              :key="card.label"
              cols="6"
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

          <v-row v-if="filteredView.billing.available && premiumCreditsFetchEnabled" class="mb-4">
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

          <BrandTableShell
            class="mb-4"
            :title="t('billing.tableLeaderboard')"
            :subtitle="leaderboardSubtitle"
          >
            <BrandDismissibleAlert
              v-if="showAiAdoptionCohorts"
              storage-key="billing-leaderboard-info"
              :close-label="t('common.close')"
            >
              <p class="text-body-2 mb-0">
                {{ adoptionLeaderboardNote }}
              </p>
              <p
                v-if="PREMIUM_CREDITS_TABLE_DISABLED"
                class="text-body-2 mb-0 mt-2"
              >
                {{ t('billing.premiumCreditsDisabledIp') }}
                {{ t('billing.premiumCreditsDisabledIpHint') }}
              </p>
            </BrandDismissibleAlert>
            <v-data-table
              :headers="userHeaders"
              :items="filteredView.users"
              :items-per-page="15"
              item-value="user_login"
              density="comfortable"
              class="brand-data-table"
            >
              <template #item.user_login="{ item }">
                <button
                  type="button"
                  class="brand-table-user-cell brand-table-user-cell--clickable"
                  @click.stop="openUserDetail(item)"
                >
                  <BrandUserAvatar
                    :seed="item.user_login"
                    :display-name="item.name"
                    :size="36"
                  />
                  <div class="text-start">
                    <div class="brand-table-user-cell__name">{{ item.user_login }}</div>
                    <div v-if="item.name || item.email" class="brand-table-user-cell__sub">
                      {{ [item.name, item.email].filter(Boolean).join(' · ') }}
                    </div>
                  </div>
                </button>
              </template>
              <template #item.usage_pattern="{ item }">
                <button
                  type="button"
                  class="brand-usage-pattern-cell-btn"
                  @click.stop="openUserDetail(item)"
                >
                  <BrandUsagePatternChip :insight="getInsight(item.user_login)" />
                </button>
              </template>
              <template #header.user_login="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colUser')"
                  :tooltip="t('billing.colUserHint')"
                />
              </template>
              <template #header.usage_pattern="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('usagePattern.colPattern')"
                  :tooltip="t('usagePattern.colPatternHint')"
                />
              </template>
              <template #header.usageDetail="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colUsage')"
                  :tooltip="t('billing.colUsageHint')"
                />
              </template>
              <template #header.ai_credits="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colAiCredits')"
                  :tooltip="t('billing.colAiCreditsHint')"
                />
              </template>
              <template #header.pruNetAmount="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colPruCost')"
                  :tooltip="t('billing.colPruCostHint')"
                />
              </template>
              <template #header.interactions="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colInteractions')"
                  :tooltip="t('billing.colInteractionsHint')"
                />
              </template>
              <template #header.generations="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colGenerations')"
                  :tooltip="t('billing.colGenerationsHint')"
                />
              </template>
              <template #header.acceptances="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colAcceptances')"
                  :tooltip="t('billing.colAcceptancesHint')"
                />
              </template>
              <template #header.locAdded="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colLocAdded')"
                  :tooltip="t('billing.colLocAddedHint')"
                />
              </template>
              <template #header.modelCount="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colModels')"
                  :tooltip="t('billing.colModelsHint')"
                />
              </template>
              <template #header.topModel="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colTopModel')"
                  :tooltip="t('billing.colTopModelHint')"
                />
              </template>
              <template #header.used_agent="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colAgent')"
                  :tooltip="t('billing.colAgentHint')"
                />
              </template>
              <template #header.used_chat="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colChat')"
                  :tooltip="t('billing.colChatHint')"
                />
              </template>
              <template #item.ai_credits="{ item }">
                <BrandAiCreditsCell
                  v-if="aiCreditsFetchEnabled && filteredView.billing.available"
                  :credits="item.ai_credits"
                />
                <span v-else class="brand-credits-cell--na">{{ t('common.emDash') }}</span>
              </template>
              <template #item.pruNetAmount="{ item }">
                <span v-if="item.pruNetAmount != null" class="brand-table-metric">
                  {{ formatCurrency(item.pruNetAmount) }}
                </span>
                <span v-else class="brand-credits-cell--na">{{ t('common.emDash') }}</span>
              </template>
              <template #item.used_agent="{ item }">
                <v-chip
                  size="small"
                  variant="flat"
                  class="brand-status-chip"
                  :class="item.used_agent ? 'brand-status-chip--yes' : 'brand-status-chip--no'"
                >
                  {{ item.used_agent ? t('common.yes') : t('common.no') }}
                </v-chip>
              </template>
              <template #item.used_chat="{ item }">
                <v-chip
                  size="small"
                  variant="flat"
                  class="brand-status-chip"
                  :class="item.used_chat ? 'brand-status-chip--yes' : 'brand-status-chip--no'"
                >
                  {{ item.used_chat ? t('common.yes') : t('common.no') }}
                </v-chip>
              </template>
              <template #item.usageDetail="{ item }">
                <v-btn
                  type="button"
                  size="small"
                  variant="flat"
                  class="brand-usage-detail-btn"
                  prepend-icon="mdi-chart-box-outline"
                  @click.stop="openUserDetail(item)"
                >
                  {{ t('billing.colUsage') }}
                </v-btn>
              </template>
            </v-data-table>
          </BrandTableShell>

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
            </div>
          </v-card>
        </div>
    </section>

    <UserUsageDetailDialog
      v-model="detailDialogOpen"
      :user="detailUser"
      :usage-insight="detailUsageInsight"
      :report-range="detailReportRange"
      :billing-available="Boolean(insights?.billing?.available)"
      :premium-credits-fetch-enabled="premiumCreditsFetchEnabled"
      :ai-credits-fetch-enabled="aiCreditsFetchEnabled"
      :team-slugs="detailTeamSlugs"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, ref, watch } from 'vue'
import BrandDismissibleAlert from '@/components/BrandDismissibleAlert.vue'
import BrandCollapsibleBillingAlert from '@/components/BrandCollapsibleBillingAlert.vue'
import BrandTableShell from '@/components/BrandTableShell.vue'
import BrandPremiumCreditsCell from '@/components/BrandPremiumCreditsCell.vue'
import BrandAiCreditsCell from '@/components/BrandAiCreditsCell.vue'
import { useAiCreditsFeature } from '@/composables/useAiCreditsFeature'
import BrandUserAvatar from '@/components/BrandUserAvatar.vue'
import BrandAiAdoptionPanel from '@/components/BrandAiAdoptionPanel.vue'
import { PREMIUM_CREDITS_TABLE_DISABLED } from '../../shared/utils/premium-credits-feature'
import UserUsageDetailDialog from '@/components/UserUsageDetailDialog.vue'
import BrandUsagePatternChip from '@/components/BrandUsagePatternChip.vue'
import { useUsagePatternInsights } from '@/composables/useUsagePatternInsights'
import { activityInputFromLeaderboardRow } from '../../shared/utils/usage-pattern-insights'
import BillingSkuDetailDialog from '@/components/BillingSkuDetailDialog.vue'
import { usePremiumCreditsFeature } from '@/composables/usePremiumCreditsFeature'
import type { UserUsageLeaderboardRow } from '../../shared/types/usage-insights'
import { billingAlertSummary } from '../../shared/utils/billing-api'
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
import { filterUsageInsightsByUser } from '../../shared/utils/usage-insights-aggregate'
import { pieSliceColors } from '@/utils/brand-colors'
import {
  brandBarChartOptions,
  brandChartOptionsInContainer,
  brandPieChartOptions,
  brandSelectMenuProps,
  paletteEntry
} from '@/utils/chart-theme'
import { Options } from '@/model/Options'
import { useRoute } from 'vue-router'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

import BrandPageSkeleton from '@/components/BrandPageSkeleton.vue'
import BrandMonthlySeatInvoiceSection from '@/components/BrandMonthlySeatInvoiceSection.vue'
import type { Seat } from '@/model/Seat'
import { useChartTooltips } from '@/utils/chart-tooltips'

export default defineComponent({
  name: 'UsageBillingViewer',
  components: {
    Bar,
    Pie,
    BrandDismissibleAlert,
    BrandCollapsibleBillingAlert,
    BrandTableShell,
    BrandPremiumCreditsCell,
    BrandAiCreditsCell,
    BrandUserAvatar,
    BrandAiAdoptionPanel,
    UserUsageDetailDialog,
    BillingSkuDetailDialog,
    BrandPageSkeleton,
    BrandMonthlySeatInvoiceSection,
    BrandUsagePatternChip
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
    const loading = ref(true)
    const error = ref<string | null>(null)
    const insights = ref<UsageInsightsResponse | null>(null)
    const selectedUser = ref<string | null>(null)
    const { fetchEnabled: premiumCreditsFetchEnabled } = usePremiumCreditsFeature()
    const { fetchEnabled: aiCreditsFetchEnabled } = useAiCreditsFeature()
    const { visible: showAiAdoptionCohorts } = useAiAdoptionCohortsFeature()
    const { ideOnly } = useAdoptionIdeOnly()
    const adoptionLeaderboardNote = computed(() =>
      t.value(ideOnly.value ? 'adoption.leaderboardColumnNoteIdeOnly' : 'adoption.leaderboardColumnNote')
    )
    const detailDialogOpen = ref(false)
    const skuDetailDialogOpen = ref(false)
    const detailUser = ref<UserUsageLeaderboardRow | null>(null)
    const detailTeamSlugs = ref<string[]>([])

    const usageCohortInputs = computed(() =>
      (insights.value?.users || []).map((u) => activityInputFromLeaderboardRow(u))
    )
    const { getInsight } = useUsagePatternInsights(usageCohortInputs)

    const detailUsageInsight = computed(() =>
      detailUser.value ? getInsight(detailUser.value.user_login) : undefined
    )

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
        selectedUser.value = null
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

    const profileCoverage = computed(() => {
      const users = insights.value?.users || []
      return {
        total: users.length,
        withEmail: users.filter((u) => u.email).length,
        withName: users.filter((u) => u.name).length
      }
    })

    const userFilterOptions = computed(() =>
      (insights.value?.users || [])
        .map((u) => ({
          login: u.user_login,
          label: [u.user_login, u.name, u.email].filter(Boolean).join(' · ')
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    )

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
      return filterUsageInsightsByUser(insights.value, selectedUser.value)
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

    const billingHighlightCards = computed(() => {
      if (!filteredView.value?.billing.available) return []
      const view = filteredView.value
      const cards: Array<{
        label: string
        value: string
        hint?: string
        cardClass: string
        tooltip: string
        opensSkuDetail?: boolean
      }> = [
        {
          label: t.value('billing.kpiNetSpend'),
          value: formatCurrency(totalNetSpend.value),
          hint: t.value('billing.kpiHintSku', { count: view.skuCosts.length }),
          cardClass: 'brand-metric-card--purple',
          tooltip: t.value('billing.kpiTooltipNetSpend'),
          opensSkuDetail: view.skuCosts.length > 0
        }
      ]
      if (premiumCreditsFetchEnabled.value) {
        cards.push({
          label: t.value('billing.kpiPremiumRequests'),
          value: formatNumber(totalPremiumQuantity.value),
          hint: t.value('billing.kpiHintUsers', { count: view.premiumByUser.length }),
          cardClass: 'brand-metric-card--turquoise',
          tooltip: t.value('billing.kpiTooltipPremiumRequests')
        })
      } else {
        cards.push({
          label: t.value('billing.kpiModelsBilled'),
          value: String(view.premiumByModel.length),
          hint: t.value('billing.kpiHintDistinct'),
          cardClass: 'brand-metric-card--turquoise',
          tooltip: t.value('billing.kpiTooltipModelsBilled')
        })
      }
      return cards
    })

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

    const totalPremiumQuantity = computed(() =>
      (filteredView.value?.premiumByModel || []).reduce((s, r) => s + r.netQuantity, 0)
    )

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

    const openUserDetail = (item: UserUsageLeaderboardRow) => {
      if (!item?.user_login) return
      detailUser.value = item
      const login = item.user_login.toLowerCase()
      detailTeamSlugs.value = [
        ...new Set(
          (insights.value?.userTeams || [])
            .filter((t) => (t.user_login || '').toLowerCase() === login)
            .map((t) => t.slug)
            .filter(Boolean)
        )
      ]
      detailDialogOpen.value = true
    }

    const userHeaders = computed(() => {
      const patternSortRaw = (a: UserUsageLeaderboardRow, b: UserUsageLeaderboardRow) => {
        const pa = getInsight(a.user_login)?.patternId ?? ''
        const pb = getInsight(b.user_login)?.patternId ?? ''
        return pa.localeCompare(pb)
      }
      const headers = [
        { title: t.value('billing.colUser'), key: 'user_login', minWidth: '200px' },
        { title: t.value('billing.colUsage'), key: 'usageDetail', sortable: false, align: 'end' as const, width: '120px' },
        {
          title: t.value('usagePattern.colPattern'),
          key: 'usage_pattern',
          sortable: true,
          sortRaw: patternSortRaw,
          minWidth: '160px'
        },
        { title: t.value('billing.colInteractions'), key: 'interactions', align: 'end' as const },
        { title: t.value('billing.colGenerations'), key: 'generations', align: 'end' as const },
        { title: t.value('billing.colAcceptances'), key: 'acceptances', align: 'end' as const },
        { title: t.value('billing.colLocAdded'), key: 'locAdded', align: 'end' as const },
        { title: t.value('billing.colModels'), key: 'modelCount', align: 'end' as const },
        { title: t.value('billing.colTopModel'), key: 'topModel' },
        { title: t.value('billing.colAgent'), key: 'used_agent', align: 'center' as const },
        { title: t.value('billing.colChat'), key: 'used_chat', align: 'center' as const }
      ]

      let insertAt = 3
      if (
        aiCreditsFetchEnabled.value &&
        filteredView.value?.billing.available
      ) {
        headers.splice(insertAt, 0, {
          title: t.value('billing.colAiCredits'),
          key: 'ai_credits',
          align: 'end' as const,
          sortable: true,
          sortRaw: (a: UserUsageLeaderboardRow, b: UserUsageLeaderboardRow) =>
            (a.ai_credits?.used ?? -1) - (b.ai_credits?.used ?? -1)
        } as (typeof headers)[number])
        insertAt += 1
      }

      if (
        !PREMIUM_CREDITS_TABLE_DISABLED &&
        premiumCreditsFetchEnabled.value &&
        filteredView.value?.billing.available
      ) {
        headers.splice(insertAt, 0, {
          title: t.value('billing.colPruCost'),
          key: 'pruNetAmount',
          align: 'end' as const,
          sortable: false
        } as (typeof headers)[number])
      }

      return headers
    })

    const leaderboardSubtitle = computed(() => {
      const parts = [t.value('billing.leaderboardReportLabel')]
      const view = filteredView.value
      if (view?.reportStartDay && view?.reportEndDay) {
        parts.unshift(`${view.reportStartDay} → ${view.reportEndDay}`)
      }
      if (
        premiumCreditsFetchEnabled.value &&
        view?.billing.available &&
        view.premiumCreditsQuota
      ) {
        parts.push(
          t.value('billing.premiumQuotaPerSeat', { quota: view.premiumCreditsQuota.toLocaleString() })
        )
      }
      return parts.join(' · ')
    })

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
      profileCoverage,
      selectedUser,
      userFilterOptions,
      kpiCards,
      usageKpiCards,
      agentChatKpiCards,
      billingHighlightCards,
      modelChartData,
      featureChartData,
      skuChartData,
      premiumModelChartData,
      teamChartData,
      brandSelectMenuProps,
      barChartOptions,
      pieChartOptions,
      userHeaders,
      leaderboardSubtitle,
      adoptionLeaderboardNote,
      showAiAdoptionCohorts,
      totalNetSpend,
      totalPremiumQuantity,
      formatNumber,
      formatCurrency,
      formatFeature,
      billingAlertSummaryText,
      premiumCreditsFetchEnabled,
      aiCreditsFetchEnabled,
      PREMIUM_CREDITS_TABLE_DISABLED,
      detailDialogOpen,
      detailUser,
      detailUsageInsight,
      detailTeamSlugs,
      detailReportRange,
      getInsight,
      usageReportRangeLabel,
      billingRangeLabel,
      usageNarrowerThanBilling,
      skuDetailDialogOpen,
      openSkuDetail,
      openUserDetail
    }
  }
})
</script>

<style scoped>
.billing-kpi-open-detail {
  white-space: nowrap;
}
</style>
