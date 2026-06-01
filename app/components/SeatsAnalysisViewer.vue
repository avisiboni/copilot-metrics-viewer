<template>
  <div>
    <div class="tiles-container seat-filter-tiles">
      <v-card
        v-for="tile in seatFilterTiles"
        :key="tile.filter"
        variant="flat"
        :ripple="false"
        class="brand-kpi-card brand-kpi-card--interactive"
        :class="{ 'brand-kpi-card--active': seatFilter === tile.filter }"
        role="button"
        tabindex="0"
        :aria-pressed="seatFilter === tile.filter"
        @click="toggleSeatFilter(tile.filter)"
        @keydown.enter.prevent="toggleSeatFilter(tile.filter)"
        @keydown.space.prevent="toggleSeatFilter(tile.filter)"
      >
        <BrandKpiTooltip :text="tile.tooltip" />
        <v-card-item class="d-flex justify-center align-center">
          <div class="tiles-text">
            <div class="brand-kpi-card__label mb-1">{{ tile.title }}</div>
            <div class="brand-kpi-card__hint mb-2">{{ tile.subtitle }}</div>
            <p class="brand-kpi-card__value text-h4 mb-0">{{ tile.count }}</p>
            <div v-if="seatFilter === tile.filter" class="brand-kpi-card__hint mt-1">
              {{ t('seats.filterHint') }}
            </div>
          </div>
        </v-card-item>
      </v-card>
    </div>

    <section class="brand-page-panel mb-4 seats-monthly-section">
      <div class="d-flex flex-wrap align-center justify-space-between gap-2 mb-2">
        <div>
          <h2 class="text-h6 mb-1">{{ t('seats.monthlyTitle') }}</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ monthlySubtitle }}
          </p>
        </div>
      </div>

      <v-alert
        v-if="historicalMode && !historyLoading && !monthlyFromHistory.length"
        type="info"
        variant="tonal"
        density="comfortable"
        class="mb-3"
      >
        {{ t('seats.monthlyHistoricalEmpty') }}
      </v-alert>

      <v-alert
        v-else-if="!historicalMode"
        type="info"
        variant="tonal"
        density="comfortable"
        class="mb-3"
      >
        {{ t('seats.monthlyEnableHistorical') }}
      </v-alert>

      <v-row v-if="monthlyRows.length" dense>
        <v-col cols="12" md="6">
          <div class="brand-chart-surface seats-monthly-chart">
            <Bar v-if="monthlyChartData" :data="monthlyChartData" :options="monthlyChartOptions" />
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <BrandTableShell :title="t('seats.monthlyTitle')" :subtitle="monthlySubtitle">
            <v-data-table
              :headers="monthlyHeaders"
              :items="monthlyTableItems"
              :items-per-page="12"
              density="comfortable"
              hide-default-footer
              class="brand-data-table"
            >
              <template #item.monthLabel="{ item }">
                <span class="brand-table-metric">{{ item.monthLabel }}</span>
              </template>
              <template #item.new_seats="{ item }">
                <span class="brand-table-metric">{{ item.new_seats }}</span>
              </template>
              <template #item.existing_seats="{ item }">
                <span class="brand-table-metric">{{ item.existing_seats }}</span>
              </template>
              <template #item.total_seats="{ item }">
                <span class="brand-table-metric font-weight-bold">{{ item.total_seats }}</span>
              </template>
              <template #item.snapshot_date="{ item }">
                <span class="brand-table-metric">{{ item.snapshot_date || t('common.emDash') }}</span>
              </template>
              <template #body.append>
                <tr v-if="monthlyTotals" class="seats-monthly-total-row">
                  <td class="font-weight-bold">{{ t('seats.monthlyTotalRow') }}</td>
                  <td class="text-end font-weight-bold brand-table-metric">{{ monthlyTotals.new_seats }}</td>
                  <td class="text-end font-weight-bold brand-table-metric text-medium-emphasis">
                    {{ t('common.emDash') }}
                  </td>
                  <td class="text-end font-weight-bold brand-table-metric">{{ monthlyTotals.total_seats }}</td>
                  <td v-if="usesHistoricalMonthly" />
                </tr>
              </template>
            </v-data-table>
          </BrandTableShell>
        </v-col>
      </v-row>

      <p v-else-if="!historyLoading" class="text-body-2 text-medium-emphasis mb-0">
        {{ t('seats.noMonthlyData') }}
      </p>
    </section>

    <v-card v-if="billing" flat class="pa-3 mb-2 brand-info-banner">
      <v-card-title class="text-h6">{{ t('seats.billingTitle') }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3"><strong>{{ t('seats.plan') }}</strong> {{ billing.plan_type || t('common.emDash') }}</v-col>
          <v-col cols="12" md="3"><strong>{{ t('seats.ideChat') }}</strong> {{ billing.ide_chat || t('common.emDash') }}</v-col>
          <v-col cols="12" md="3"><strong>{{ t('seats.platformChat') }}</strong> {{ billing.platform_chat || t('common.emDash') }}</v-col>
          <v-col cols="12" md="3"><strong>{{ t('seats.cli') }}</strong> {{ billing.cli || t('common.emDash') }}</v-col>
          <v-col cols="12" md="3"><strong>{{ t('seats.publicSuggestions') }}</strong> {{ billing.public_code_suggestions || t('common.emDash') }}</v-col>
          <v-col cols="12" md="3"><strong>{{ t('seats.seatManagement') }}</strong> {{ billing.seat_management_setting || t('common.emDash') }}</v-col>
          <v-col cols="12" md="3"><strong>{{ t('seats.totalSeats') }}</strong> {{ billing.seat_breakdown?.total ?? t('common.emDash') }}</v-col>
          <v-col cols="12" md="3"><strong>{{ t('seats.activeCycle') }}</strong> {{ billing.seat_breakdown?.active_this_cycle ?? t('common.emDash') }}</v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <section class="brand-page-panel">
        <BrandTableShell :title="tableTitle">
          <template v-if="seatFilter !== 'all'" #toolbar>
            <v-chip
              size="small"
              closable
              class="brand-filter-chip"
              @click:close="seatFilter = 'all'"
            >
              {{ activeFilterLabel }}
            </v-chip>
          </template>
        <v-data-table
          :headers="headers"
          :items="displayedSeats"
          :items-per-page="10"
          density="comfortable"
          class="brand-data-table"
        >
          <template #item="{ item, index }">
            <tr>
              <td>{{ index + 1 }}</td>
              <td>{{ item.login }}</td>
              <td>{{ item.id }}</td>
              <td>{{ item.team }}</td>
              <td>{{ item.created_at }} {{ item.plan_type }}</td>
              <td>{{ item.last_activity_at || t('common.emDash') }}</td>
              <td>{{ item.last_activity_editor || t('common.emDash') }}</td>
            </tr>
          </template>
        </v-data-table>
        </BrandTableShell>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Bar } from 'vue-chartjs';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import BrandTableShell from '@/components/BrandTableShell.vue';
import { Options } from '@/model/Options';
import type { Seat } from '@/model/Seat';
import type { CopilotBillingSettings } from '../../shared/types/copilot-usage';
import {
  aggregateSeatHistoryByMonth,
  aggregateSeatsAssignedByMonth,
  buildMonthlySeatInvoiceRows,
  formatSeatMonthLabel,
  type SeatHistorySnapshot,
} from '../../shared/utils/seats-monthly-aggregate';
import {
  brandBarChartOptionsWithLegend,
  brandChartOptionsInContainer,
} from '@/utils/chart-theme';
import { isEnvTruthy } from '../../shared/utils/env-boolean';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export type SeatStatusFilter = 'all' | 'noshow' | 'inactive7' | 'inactive30';

function isNoshowSeat(seat: Seat): boolean {
  return !seat.last_activity_at;
}

function isInactive7Seat(seat: Seat, oneWeekAgo: Date): boolean {
  if (!seat.last_activity_at) return true;
  return new Date(seat.last_activity_at) < oneWeekAgo;
}

function isInactive30Seat(seat: Seat, thirtyDaysAgo: Date): boolean {
  if (!seat.last_activity_at) return true;
  return new Date(seat.last_activity_at) < thirtyDaysAgo;
}

function matchesSeatFilter(seat: Seat, filter: SeatStatusFilter, oneWeekAgo: Date, thirtyDaysAgo: Date): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'noshow':
      return isNoshowSeat(seat);
    case 'inactive7':
      return isInactive7Seat(seat, oneWeekAgo);
    case 'inactive30':
      return isInactive30Seat(seat, thirtyDaysAgo);
  }
}

function sortSeatsByActivity(seats: Seat[]): Seat[] {
  return [...seats].sort((a, b) => {
    if (a.last_activity_at === null) return -1;
    if (b.last_activity_at === null) return 1;
    return new Date(a.last_activity_at) > new Date(b.last_activity_at) ? 1 : -1;
  });
}

export default defineComponent({
  name: 'SeatsAnalysisViewer',
  components: { Bar, BrandTableShell },
  props: {
    seats: {
      type: Array as () => Seat[],
      required: true,
      default: () => []
    }
  },
  setup(props) {
    const { t, apiLocale } = useAppI18n();
    const route = useRoute();
    const config = useRuntimeConfig();
    const historicalMode = computed(() =>
      isEnvTruthy(config.public.enableHistoricalMode)
    );

    const billing = ref<CopilotBillingSettings | null>(null);
    const allSeats = ref<Seat[]>([]);
    const seatFilter = ref<SeatStatusFilter>('all');
    const seatHistory = ref<SeatHistorySnapshot[]>([]);
    const historyLoading = ref(false);

    const monthlyChartOptions = brandBarChartOptionsWithLegend({
      ...brandChartOptionsInContainer,
      scales: {
        x: { stacked: true },
        y: { stacked: true },
      },
    });

    const activityCutoffs = computed(() => {
      const oneWeekAgo = new Date();
      const thirtyDaysAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return { oneWeekAgo, thirtyDaysAgo };
    });

    watch(
      () => props.seats,
      (seats) => {
        if (seats && Array.isArray(seats)) {
          allSeats.value = sortSeatsByActivity(seats);
        } else {
          allSeats.value = [];
        }
      },
      { immediate: true }
    );

    async function loadSeatHistory() {
      if (!historicalMode.value) {
        seatHistory.value = [];
        return;
      }
      historyLoading.value = true;
      try {
        const options = Options.fromRoute(route);
        seatHistory.value = await $fetch<SeatHistorySnapshot[]>('/api/seats-history', {
          query: options.toParams(),
        });
      } catch {
        seatHistory.value = [];
      } finally {
        historyLoading.value = false;
      }
    }

    onMounted(async () => {
      try {
        const response = await $fetch<{ billing: CopilotBillingSettings | null }>('/api/billing');
        billing.value = response.billing;
      } catch {
        billing.value = null;
      }
      await loadSeatHistory();
    });

    const noshowSeats = computed(() =>
      allSeats.value.filter((seat) => isNoshowSeat(seat)).length
    );

    const unusedSeatsInSevenDays = computed(() => {
      const { oneWeekAgo } = activityCutoffs.value;
      return allSeats.value.filter((seat) => isInactive7Seat(seat, oneWeekAgo)).length;
    });

    const unusedSeatsInThirtyDays = computed(() => {
      const { thirtyDaysAgo } = activityCutoffs.value;
      return allSeats.value.filter((seat) => isInactive30Seat(seat, thirtyDaysAgo)).length;
    });

    const displayedSeats = computed(() => {
      const { oneWeekAgo, thirtyDaysAgo } = activityCutoffs.value;
      return allSeats.value.filter((seat) =>
        matchesSeatFilter(seat, seatFilter.value, oneWeekAgo, thirtyDaysAgo)
      );
    });

    const monthlyFromHistory = computed(() => aggregateSeatHistoryByMonth(seatHistory.value));

    const monthlyFromAssignments = computed(() =>
      aggregateSeatsAssignedByMonth(allSeats.value)
    );

    const monthlyRows = computed(() => {
      if (monthlyFromHistory.value.length > 0) {
        return monthlyFromHistory.value;
      }
      return monthlyFromAssignments.value;
    });

    const usesHistoricalMonthly = computed(() => monthlyFromHistory.value.length > 0);

    const monthlySubtitle = computed(() =>
      usesHistoricalMonthly.value
        ? t.value('seats.monthlySubtitleHistorical')
        : t.value('seats.monthlySubtitleAssigned')
    );

    const monthlyInvoiceRows = computed(() =>
      buildMonthlySeatInvoiceRows(
        monthlyRows.value,
        usesHistoricalMonthly.value ? 'historical' : 'assignments'
      )
    );

    const monthlyTableItems = computed(() =>
      monthlyInvoiceRows.value.map((row) => ({
        ...row,
        monthLabel: formatSeatMonthLabel(row.month, apiLocale.value),
      }))
    );

    const monthlyTotals = computed(() => {
      const rows = monthlyInvoiceRows.value;
      const last = rows.at(-1);
      if (!last) return null;
      return {
        new_seats: rows.reduce((sum, row) => sum + row.new_seats, 0),
        total_seats: last.total_seats,
      };
    });

    const monthlyChartData = computed(() => {
      if (!monthlyTableItems.value.length) return null;
      return {
        labels: monthlyTableItems.value.map((row) => row.monthLabel),
        datasets: [
          {
            label: t.value('seats.monthlyColExisting'),
            data: monthlyTableItems.value.map((row) => row.existing_seats),
            backgroundColor: 'rgba(218, 217, 235, 0.95)',
            borderColor: 'rgb(100, 54, 223)',
            borderWidth: 1,
            stack: 'seats',
          },
          {
            label: t.value('seats.monthlyColNew'),
            data: monthlyTableItems.value.map((row) => row.new_seats),
            backgroundColor: 'rgba(100, 54, 223, 0.88)',
            borderColor: 'rgb(50, 15, 91)',
            borderWidth: 1,
            stack: 'seats',
          },
        ],
      };
    });

    const monthlyHeaders = computed(() => {
      const base = [
        { title: t.value('seats.monthlyColMonth'), key: 'monthLabel' },
        { title: t.value('seats.monthlyColNew'), key: 'new_seats', align: 'end' as const },
        { title: t.value('seats.monthlyColExisting'), key: 'existing_seats', align: 'end' as const },
        { title: t.value('seats.monthlyColTotal'), key: 'total_seats', align: 'end' as const },
      ];
      if (usesHistoricalMonthly.value) {
        base.push({
          title: t.value('seats.monthlyColSnapshot'),
          key: 'snapshot_date',
          align: 'end' as const,
        });
      }
      return base;
    });

    const isTeamView = computed(() => config.public.scope?.includes('team') && config.public.githubTeam);
    const currentTeam = computed(() => config.public.githubTeam || '');

    const scope = computed(() => String(config.public.scope || ''));
    const teamScope = computed(() => {
      const translate = t.value;
      if (isTeamView.value) {
        return translate('seats.scopeToTeam', { team: currentTeam.value });
      }
      if (scope.value.includes('organization')) {
        return translate('seats.scopeInOrg');
      }
      if (scope.value.includes('enterprise')) {
        return translate('seats.scopeInEnt');
      }
      return translate('seats.scopeCurrentOrgEnt');
    });

    const seatFilterTiles = computed(() => [
      {
        filter: 'all' as const,
        title: t.value('seats.totalAssigned'),
        subtitle: isTeamView.value
          ? t.value('seats.subtitleAssignedTeam', { team: currentTeam.value })
          : t.value('seats.subtitleAssigned'),
        count: allSeats.value.length,
        tooltip: t.value('seats.tooltipTotal', { scope: teamScope.value })
      },
      {
        filter: 'noshow' as const,
        title: t.value('seats.assignedNeverUsed'),
        subtitle: t.value('seats.subtitleNeverUsed'),
        count: noshowSeats.value,
        tooltip: t.value('seats.tooltipNeverUsed')
      },
      {
        filter: 'inactive7' as const,
        title: t.value('seats.noActivity7'),
        subtitle: t.value('seats.subtitleNoUse7'),
        count: unusedSeatsInSevenDays.value,
        tooltip: t.value('seats.tooltipInactive', { days: 7 })
      },
      {
        filter: 'inactive30' as const,
        title: t.value('seats.noActivity30'),
        subtitle: t.value('seats.subtitleNoUse30'),
        count: unusedSeatsInThirtyDays.value,
        tooltip: t.value('seats.tooltipInactive', { days: 30 })
      }
    ]);

    const filterLabels = computed<Record<SeatStatusFilter, string>>(() => ({
      all: t.value('seats.tableAll'),
      noshow: t.value('seats.tableNeverUsed'),
      inactive7: t.value('seats.tableNoActivity7'),
      inactive30: t.value('seats.tableNoActivity30')
    }));

    const tableTitle = computed(() =>
      seatFilter.value === 'all' ? t.value('seats.tableAll') : filterLabels.value[seatFilter.value]
    );

    const activeFilterLabel = computed(() => filterLabels.value[seatFilter.value]);

    const headers = computed(() => [
      { title: t.value('seats.colSerial'), key: 'serialNumber' },
      { title: t.value('seats.colLogin'), key: 'login' },
      { title: t.value('seats.colGithubId'), key: 'id' },
      { title: t.value('seats.colTeam'), key: 'team' },
      { title: t.value('seats.colAssigned'), key: 'created_at' },
      { title: t.value('seats.colLastActivity'), key: 'last_activity_at' },
      { title: t.value('seats.colLastEditor'), key: 'last_activity_editor' }
    ]);

    function toggleSeatFilter(filter: SeatStatusFilter) {
      seatFilter.value = seatFilter.value === filter ? 'all' : filter;
    }

    return {
      billing,
      allSeats,
      seatFilter,
      displayedSeats,
      seatFilterTiles,
      tableTitle,
      activeFilterLabel,
      headers,
      toggleSeatFilter,
      isTeamView,
      currentTeam,
      historicalMode,
      historyLoading,
      monthlyFromHistory,
      usesHistoricalMonthly,
      monthlyRows,
      monthlyInvoiceRows,
      monthlyTotals,
      monthlySubtitle,
      monthlyTableItems,
      monthlyChartData,
      monthlyChartOptions,
      monthlyHeaders,
      t,
    };
  }
});
</script>

<style scoped>
.seats-monthly-chart {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seats-monthly-chart :deep(canvas) {
  max-height: 280px;
}

.seats-monthly-total-row td {
  border-top: 2px solid color-mix(in srgb, var(--brand-lavender) 80%, white);
  padding-top: 12px !important;
}
</style>
