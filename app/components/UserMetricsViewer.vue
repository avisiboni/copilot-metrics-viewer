<template>
  <div>
    <section class="brand-page-panel">
        <BrandPageSkeleton
          v-if="loading"
          layout="users"
          :aria-label="t('users.loading')"
        />

        <div v-else-if="error" class="d-flex justify-center align-center" style="min-height: 300px;">
          <v-alert type="error" class="mb-4">
            <v-alert-title>{{ t('users.errorTitle') }}</v-alert-title>
            {{ error }}
          </v-alert>
        </div>

        <div v-else>
          <h2 class="mb-2">{{ t('users.title') }}</h2>
          <BrandDismissibleAlert
            v-if="!premiumCreditsFetchEnabled"
            storage-key="users-premium-credits-coming-soon"
            :close-label="t('common.close')"
            :title="t('users.premiumCreditsComingSoonTitle')"
            density="comfortable"
            wrapper-class="mb-3"
          >
            <p class="mb-2">{{ t('users.premiumCreditsComingSoonBody') }}</p>
            <p class="mb-0 text-caption">{{ t('users.premiumCreditsComingSoonHint') }}</p>
          </BrandDismissibleAlert>
          <v-card
            v-else
            flat
            class="pa-3 mb-3 brand-info-banner"
          >
            <div class="d-flex justify-space-between align-center flex-wrap ga-2">
              <div>
                <div class="text-h6">{{ t('users.billingStatus') }}</div>
                <div class="text-caption">
                  {{ t('users.billingStatusHintColumn') }}
                </div>
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                :loading="checkingBillingStatus"
                @click="checkBillingStatus"
              >
                {{ t('users.checkNow') }}
              </v-btn>
            </div>
          </v-card>
          <BrandCollapsibleBillingAlert
            v-if="premiumCreditsFetchEnabled && premiumCreditsMeta && !premiumCreditsMeta.available && !premiumCreditsMeta.fetchDisabled"
            :title="t('users.premiumNeedsBillingTitle')"
            :summary="premiumCreditsAlertSummary"
            variant="warning"
          >
            <p class="mb-2">
              {{ t('users.billingUnavailablePeriod', { since: premiumCreditsMeta.since, until: premiumCreditsMeta.until }) }}
              <span v-if="premiumCreditsMeta.httpStatus">
                {{ t('users.billingHttpStatus', { status: premiumCreditsMeta.httpStatus }) }}
              </span>
              {{ premiumCreditsMeta.reason || t('users.billingReasonFallback') }}
            </p>
            <p v-if="premiumCreditsMeta.tokenScopes" class="mb-2">
              {{ t('users.tokenScopes', { scopes: premiumCreditsMeta.tokenScopes }) }}
            </p>
            <p class="mb-0">
              {{ t('users.addScopePat') }}
            </p>
          </BrandCollapsibleBillingAlert>
          <v-alert
            v-else-if="premiumCreditsFetchEnabled && premiumCreditsMeta?.available && premiumLoading"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-3 brand-alert brand-alert--info"
          >
            {{ t('users.premiumLoadingProgress', {
              loaded: premiumLoadProgress.loaded,
              total: premiumLoadProgress.total
            }) }}
          </v-alert>
          <v-alert
            v-else-if="premiumCreditsFetchEnabled && premiumCreditsMeta?.available && premiumCreditsMeta.perUserDataAvailable"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-3 brand-alert brand-alert--info"
          >
            {{ t('users.subtitleBillingRange', { range: `${premiumCreditsMeta.since} → ${premiumCreditsMeta.until}` }) }}
            ({{ t('users.usersWithPruInWindow', { count: premiumCreditsMeta.usersWithBillingData }) }})
          </v-alert>
          <v-alert
            v-else-if="premiumCreditsFetchEnabled && premiumLoadError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3 brand-alert brand-alert--error"
          >
            {{ premiumLoadError }}
          </v-alert>
          <v-alert
            v-else-if="premiumCreditsFetchEnabled && premiumCreditsMeta?.available && !premiumCreditsMeta.perUserDataAvailable"
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-3 brand-alert brand-alert--warning"
          >
            {{ t('users.perUserPruUnavailable') }}
          </v-alert>

          <BrandAiAdoptionPanel
            v-if="adoptionByPhase.length"
            :phases="adoptionByPhase"
          />

          <v-row class="mb-2">
            <v-col cols="12" md="4">
              <v-text-field
                v-model="selectedDay"
                class="brand-date-field"
                :label="t('users.filterByDay')"
                type="date"
                variant="outlined"
                density="compact"
                clearable
                :hint="t('users.filterDayHint')"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="selectedUser"
                :items="userFilterOptions"
                :menu-props="brandSelectMenuProps"
                item-title="label"
                item-value="login"
                :label="t('users.filterUser')"
                :placeholder="t('common.allUsers')"
                variant="outlined"
                density="compact"
                clearable
                prepend-inner-icon="mdi-account-filter"
              />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <v-btn color="primary" :loading="loading" @click="loadUsers">{{ t('users.applyFilters') }}</v-btn>
            </v-col>
          </v-row>

          <BrandTableShell
            :title="t('users.tableTitle')"
            :subtitle="tableSubtitle"
          >
            <BrandDismissibleAlert
              storage-key="users-leaderboard-info"
              :close-label="t('common.close')"
            >
              <p class="text-body-2 mb-0">
                {{ t('adoption.leaderboardColumnNote') }}
              </p>
              <p
                v-if="PREMIUM_CREDITS_TABLE_DISABLED"
                class="text-body-2 mb-0 mt-2"
              >
                {{ t('billing.premiumCreditsDisabledIp') }}
                {{ t('billing.premiumCreditsDisabledIpHint') }}
              </p>
            </BrandDismissibleAlert>
            <template #toolbar>
              <v-text-field
                v-model="tableSearch"
                density="compact"
                variant="outlined"
                hide-details
                clearable
                prepend-inner-icon="mdi-magnify"
                :placeholder="t('users.searchUsers')"
                class="brand-table-search"
                style="min-width: 220px;"
              />
            </template>

            <v-data-table
              :headers="headers"
              :items="displayedUsers"
              :search="tableSearch"
              :items-per-page="15"
              density="comfortable"
              class="brand-data-table"
            >
              <template #item.user_login="{ item }">
                <div class="brand-table-user-cell">
                  <BrandUserAvatar
                    :seed="item.user_login"
                    :display-name="item.name"
                    :size="36"
                  />
                  <div>
                    <div class="brand-table-user-cell__name">{{ item.user_login }}</div>
                    <div v-if="item.name || item.email" class="brand-table-user-cell__sub">
                      {{ [item.name, item.email].filter(Boolean).join(' · ') }}
                    </div>
                  </div>
                </div>
              </template>

              <template #item.ai_adoption_phase="{ item }">
                <BrandAiAdoptionPhaseChip :phase="item.ai_adoption_phase" />
              </template>

              <template #header.ai_adoption_phase>
                <BrandTableHeaderHint
                  :label="t('adoption.colAdoptionPhase')"
                  :tooltip="t('adoption.colAdoptionPhaseHint')"
                />
              </template>

              <template #header.premium_credits>
                <BrandTableHeaderHint
                  :label="t('billing.colPremiumCredits')"
                  :tooltip="PREMIUM_CREDITS_TABLE_DISABLED
                    ? t('billing.premiumCreditsDisabledIpHint')
                    : t('billing.premiumCreditsCacheHint')"
                />
              </template>

              <template #item.premium_credits>
                <BrandPremiumCreditsCell disabled />
              </template>

              <template #item.user_initiated_interaction_count="{ item }">
                <span class="brand-table-metric">{{ formatNum(item.user_initiated_interaction_count) }}</span>
              </template>

              <template #item.code_generation_activity_count="{ item }">
                <span class="brand-table-metric">{{ formatNum(item.code_generation_activity_count) }}</span>
              </template>

              <template #item.code_acceptance_activity_count="{ item }">
                <span class="brand-table-metric">{{ formatNum(item.code_acceptance_activity_count) }}</span>
              </template>

              <template #item.loc_added_sum="{ item }">
                <span class="brand-table-metric">{{ formatNum(item.loc_added_sum) }}</span>
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
            </v-data-table>
          </BrandTableShell>
        </div>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { brandSelectMenuProps } from '@/utils/chart-theme';
import { useTabReportRange } from '@/composables/useTabReportRange';
import type { UserUsageRecord } from '../../shared/types/copilot-usage';
import type { BillingFetchResult } from '../../shared/types/billing-usage';
import BrandCollapsibleBillingAlert from '@/components/BrandCollapsibleBillingAlert.vue';
import BrandTableShell from '@/components/BrandTableShell.vue';
import BrandPremiumCreditsCell from '@/components/BrandPremiumCreditsCell.vue';
import BrandUserAvatar from '@/components/BrandUserAvatar.vue';
import { billingAlertSummary } from '../../shared/utils/billing-api';

interface UserMetricsApiResponse {
  reportStartDay?: string;
  reportEndDay?: string;
  reportDay?: string;
  users: UserUsageRecord[];
  adoptionByPhase?: import('../../shared/types/copilot-usage').AiAdoptionPhaseAggregate[];
  premiumCredits?: {
    available: boolean;
    periodLabel?: string;
    since?: string;
    until?: string;
    defaultQuota: number;
    reason?: string;
    usersWithBillingData?: number;
    perUserDataAvailable?: boolean;
    httpStatus?: number;
    tokenScopes?: string;
    fetchDisabled?: boolean;
  };
}

import BrandDismissibleAlert from '@/components/BrandDismissibleAlert.vue'
import BrandPageSkeleton from '@/components/BrandPageSkeleton.vue'
import BrandAiAdoptionPanel from '@/components/BrandAiAdoptionPanel.vue'
import BrandAiAdoptionPhaseChip from '@/components/BrandAiAdoptionPhaseChip.vue'
import type { AiAdoptionPhaseAggregate } from '../../shared/types/copilot-usage'
import { usePremiumCreditsBatchLoader } from '@/composables/usePremiumCreditsBatchLoader'
import { usePremiumCreditsFeature } from '@/composables/usePremiumCreditsFeature'
import { PREMIUM_CREDITS_TABLE_DISABLED } from '../../shared/utils/premium-credits-feature'

export default defineComponent({
  name: 'UserMetricsViewer',
  components: {
    BrandDismissibleAlert,
    BrandCollapsibleBillingAlert,
    BrandTableShell,
    BrandPremiumCreditsCell,
    BrandUserAvatar,
    BrandAiAdoptionPanel,
    BrandAiAdoptionPhaseChip,
    BrandPageSkeleton,
  },
  props: {
    dateRange: {
      type: Object as () => ({ since?: string; until?: string }),
      default: () => ({})
    },
    dateRangeDescription: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const { t } = useAppI18n();
    const { fetchEnabled: premiumCreditsFetchEnabled } = usePremiumCreditsFeature();
    const tabReportRange = useTabReportRange();
    const loading = ref(true);
    const error = ref<string | null>(null);
    const allUsers = ref<UserUsageRecord[]>([]);
    const adoptionByPhase = ref<AiAdoptionPhaseAggregate[]>([]);
    const reportRange = ref<string | null>(null);
    const selectedDay = ref<string | undefined>(undefined);
    const selectedUser = ref<string | null>(null);
    const tableSearch = ref('');

    const userFilterOptions = computed(() =>
      allUsers.value
        .map((u) => ({
          login: u.user_login,
          label: [u.user_login, u.name, u.email].filter(Boolean).join(' · ')
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    );

    const displayedUsers = computed(() => {
      if (!selectedUser.value) {
        return allUsers.value;
      }
      const login = selectedUser.value.toLowerCase();
      return allUsers.value.filter((u) => u.user_login.toLowerCase() === login);
    });

    const premiumCreditsMeta = ref<UserMetricsApiResponse['premiumCredits']>();
    const checkingBillingStatus = ref(false);

    const {
      premiumLoading,
      premiumLoadProgress,
      premiumLoadError,
      loadPremiumCreditsInBackground,
      cancelPremiumCreditsLoad,
      isPremiumLoginLoading
    } = usePremiumCreditsBatchLoader(allUsers);

    const tableSubtitle = computed(() => {
      const parts: string[] = [];
      if (reportRange.value) {
        parts.push(reportRange.value);
      }
      if (premiumCreditsMeta.value?.available) {
        parts.push(
          t.value('users.subtitleBillingRangeDetailed', {
            since: premiumCreditsMeta.value.since,
            until: premiumCreditsMeta.value.until,
            count: premiumCreditsMeta.value.usersWithBillingData
          })
        );
      } else if (premiumCreditsMeta.value && !premiumCreditsMeta.value.available) {
        parts.push(t.value('users.subtitleBillingUnavailable'));
      }
      return parts.join(' · ');
    });

    const headers = computed(() => {
      const base = [
      { title: t.value('billing.colUser'), key: 'user_login', minWidth: '200px' },
      { title: t.value('adoption.colAdoptionPhase'), key: 'ai_adoption_phase', sortable: true, minWidth: '150px' },
      { title: t.value('billing.colPremiumCredits'), key: 'premium_credits', sortable: false, minWidth: '190px' },
      { title: t.value('billing.colInteractions'), key: 'user_initiated_interaction_count', align: 'end' as const },
      { title: t.value('billing.colGenerations'), key: 'code_generation_activity_count', align: 'end' as const },
      { title: t.value('billing.colAcceptances'), key: 'code_acceptance_activity_count', align: 'end' as const },
      { title: t.value('billing.colLocAdded'), key: 'loc_added_sum', align: 'end' as const },
      { title: t.value('billing.colAgent'), key: 'used_agent', align: 'center' as const },
      { title: t.value('billing.colChat'), key: 'used_chat', align: 'center' as const }
      ];
      return base;
    });

    const formatNum = (n?: number) => (n ?? 0).toLocaleString();

    const loadUsers = async () => {
      loading.value = true;
      error.value = null;
      premiumCreditsMeta.value = undefined;
      cancelPremiumCreditsLoad();

      try {
        const params: Record<string, string> = {};
        if (selectedDay.value) {
          params.day = selectedDay.value;
        } else if (props.dateRange.since && props.dateRange.until) {
          params.since = props.dateRange.since;
          params.until = props.dateRange.until;
        }
        const response = await $fetch<UserMetricsApiResponse>('/api/user-metrics', { params });
        allUsers.value = response.users || [];
        adoptionByPhase.value = response.adoptionByPhase || [];
        premiumCreditsMeta.value = response.premiumCredits;
        selectedUser.value = null;

        if (response.reportDay) {
          reportRange.value = t.value('users.reportDay', { day: response.reportDay });
        } else if (response.reportStartDay && response.reportEndDay) {
          reportRange.value = `${response.reportStartDay} → ${response.reportEndDay}`;
        } else {
          reportRange.value = null;
        }

        if (
          !PREMIUM_CREDITS_TABLE_DISABLED &&
          premiumCreditsFetchEnabled.value &&
          response.premiumCredits?.available &&
          !response.premiumCredits.fetchDisabled
        ) {
          const logins = (response.users || []).map((u) => u.user_login);
          void loadPremiumCreditsInBackground({
            logins,
            since: response.premiumCredits.since,
            until: response.premiumCredits.until,
            day: selectedDay.value,
            billingAvailable: true
          }).then(() => {
            if (premiumCreditsMeta.value) {
              const withPru = allUsers.value.filter(
                (u) => u.premium_credits?.source === 'billing'
              ).length;
              premiumCreditsMeta.value = {
                ...premiumCreditsMeta.value,
                perUserDataAvailable: withPru > 0,
                usersWithBillingData: withPru
              };
            }
          });
        }
      } catch (err: unknown) {
        error.value = err instanceof Error ? err.message : t.value('users.errorLoad');
      } finally {
        loading.value = false;
      }
    };

    const checkBillingStatus = async () => {
      if (!premiumCreditsFetchEnabled.value) {
        return;
      }
      checkingBillingStatus.value = true;
      try {
        const params: Record<string, string> = {};
        if (selectedDay.value) {
          params.day = selectedDay.value;
        } else if (props.dateRange.since && props.dateRange.until) {
          params.since = props.dateRange.since;
          params.until = props.dateRange.until;
        }

        const res = await $fetch<{
          since: string;
          until: string;
          billing: BillingFetchResult;
        }>('/api/billing-status', { params });

        const billing = res.billing;
        premiumCreditsMeta.value = {
          available: billing.available,
          since: res.since,
          until: res.until,
          defaultQuota: premiumCreditsMeta.value?.defaultQuota ?? 1000,
          reason: billing.reason,
          httpStatus: billing.httpStatus,
          tokenScopes: billing.tokenScopes,
          usersWithBillingData: 0
        };

        // If billing is available, reload so each user row gets real numbers.
        if (billing.available) {
          await loadUsers();
        }
      } catch (err: unknown) {
        premiumCreditsMeta.value = {
          available: false,
          since: props.dateRange.since,
          until: props.dateRange.until,
          defaultQuota: premiumCreditsMeta.value?.defaultQuota ?? 1000,
          reason: err instanceof Error ? err.message : t.value('users.errorBilling'),
          httpStatus: undefined,
          tokenScopes: undefined,
          usersWithBillingData: 0
        };
      } finally {
        checkingBillingStatus.value = false;
      }
    };

    watch(reportRange, (value) => {
      tabReportRange.value = value;
    });

    watch(
      () => [props.dateRange.since, props.dateRange.until, selectedDay.value],
      () => {
        if (props.dateRange.since && props.dateRange.until && !selectedDay.value) {
          loadUsers();
        }
      }
    );

    onMounted(loadUsers);

    onUnmounted(() => {
      cancelPremiumCreditsLoad();
      tabReportRange.value = null;
    });

    const premiumCreditsAlertSummary = computed(() => {
      const meta = premiumCreditsMeta.value;
      if (!meta) return '';
      return billingAlertSummary(meta);
    });

    return {
      loading,
      error,
      allUsers,
      adoptionByPhase,
      displayedUsers,
      userFilterOptions,
      headers,
      premiumCreditsFetchEnabled,
      PREMIUM_CREDITS_TABLE_DISABLED,
      premiumCreditsMeta,
      premiumCreditsAlertSummary,
      premiumLoading,
      premiumLoadProgress,
      premiumLoadError,
      isPremiumLoginLoading,
      checkingBillingStatus,
      reportRange,
      tableSubtitle,
      selectedDay,
      selectedUser,
      tableSearch,
      brandSelectMenuProps,
      formatNum,
      loadUsers,
      checkBillingStatus,
      t
    };
  }
});
</script>
