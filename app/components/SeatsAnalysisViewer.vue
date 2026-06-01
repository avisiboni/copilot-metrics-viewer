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
            <div class="text-h6 mb-1">{{ tile.title }}</div>
            <div class="text-caption">{{ tile.subtitle }}</div>
            <p class="text-h4">{{ tile.count }}</p>
            <div v-if="seatFilter === tile.filter" class="text-caption text-medium-emphasis mt-1">
              {{ t('seats.filterHint') }}
            </div>
          </div>
        </v-card-item>
      </v-card>
    </div>

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
import BrandTableShell from '@/components/BrandTableShell.vue';
import type { Seat } from '@/model/Seat';
import type { CopilotBillingSettings } from '../../shared/types/copilot-usage';

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
  components: { BrandTableShell },
  props: {
    seats: {
      type: Array as () => Seat[],
      required: true,
      default: () => []
    }
  },
  setup(props) {
    const { t } = useAppI18n();
    const billing = ref<CopilotBillingSettings | null>(null);
    const allSeats = ref<Seat[]>([]);
    const seatFilter = ref<SeatStatusFilter>('all');

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

    onMounted(async () => {
      try {
        const response = await $fetch<{ billing: CopilotBillingSettings | null }>('/api/billing');
        billing.value = response.billing;
      } catch {
        billing.value = null;
      }
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

    const config = useRuntimeConfig();
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
      t
    };
  }
});
</script>
