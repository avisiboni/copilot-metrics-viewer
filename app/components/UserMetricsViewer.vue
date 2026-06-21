<template>
  <div>
    <section class="brand-page-panel">
        <BrandPageSkeleton
          v-if="loading"
          layout="users"
          :aria-label="t('users.loading')"
        />

        <div v-else-if="error" class="d-flex justify-center align-center" style="min-height: 300px;">
          <BrandDismissibleAlert
            type="error"
            alert-class="brand-alert brand-alert--error mb-4"
            :close-label="t('common.close')"
            :title="t('users.errorTitle')"
          >
            {{ error }}
          </BrandDismissibleAlert>
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
            storage-key="users-premium-needs-billing"
            :close-label="t('common.close')"
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
          <BrandDismissibleAlert
            v-else-if="premiumCreditsFetchEnabled && premiumCreditsMeta?.available && premiumLoading"
            type="info"
            density="compact"
            alert-class="mb-3 brand-alert brand-alert--info"
            :close-label="t('common.close')"
          >
            {{ t('users.premiumLoadingProgress', {
              loaded: premiumLoadProgress.loaded,
              total: premiumLoadProgress.total
            }) }}
          </BrandDismissibleAlert>
          <BrandDismissibleAlert
            v-else-if="premiumCreditsFetchEnabled && premiumCreditsMeta?.available && premiumCreditsMeta.perUserDataAvailable"
            storage-key="users-premium-billing-range"
            type="info"
            density="compact"
            alert-class="mb-3 brand-alert brand-alert--info"
            :close-label="t('common.close')"
          >
            {{ t('users.subtitleBillingRange', { range: `${premiumCreditsMeta.since} → ${premiumCreditsMeta.until}` }) }}
            ({{ t('users.usersWithPruInWindow', { count: premiumCreditsMeta.usersWithBillingData }) }})
          </BrandDismissibleAlert>
          <BrandDismissibleAlert
            v-else-if="premiumCreditsFetchEnabled && premiumLoadError"
            type="error"
            density="compact"
            alert-class="mb-3 brand-alert brand-alert--error"
            :close-label="t('common.close')"
          >
            {{ premiumLoadError }}
          </BrandDismissibleAlert>
          <BrandDismissibleAlert
            v-else-if="premiumCreditsFetchEnabled && premiumCreditsMeta?.available && !premiumCreditsMeta.perUserDataAvailable"
            storage-key="users-per-user-pru-unavailable"
            type="warning"
            density="compact"
            alert-class="mb-3 brand-alert brand-alert--warning"
            :close-label="t('common.close')"
          >
            {{ t('users.perUserPruUnavailable') }}
          </BrandDismissibleAlert>
          <BrandDismissibleAlert
            v-if="aiCreditsFetchEnabled && aiCreditsMeta?.available && aiCreditsLoading"
            type="info"
            density="compact"
            alert-class="mb-3 brand-alert brand-alert--info"
            :close-label="t('common.close')"
          >
            {{ t('users.aiCreditsLoadingProgress', {
              loaded: aiCreditsLoadProgress.loaded,
              total: aiCreditsLoadProgress.total
            }) }}
          </BrandDismissibleAlert>
          <BrandDismissibleAlert
            v-else-if="aiCreditsFetchEnabled && aiCreditsMeta?.available && aiCreditsMeta.perUserDataAvailable"
            storage-key="users-ai-credits-billing-range"
            type="info"
            density="compact"
            alert-class="mb-3 brand-alert brand-alert--info"
            :close-label="t('common.close')"
          >
            {{ t('users.subtitleBillingRange', { range: `${aiCreditsMeta.since} → ${aiCreditsMeta.until}` }) }}
            ({{ t('users.usersWithAiCreditsInWindow', { count: aiCreditsMeta.usersWithBillingData }) }})
          </BrandDismissibleAlert>
          <BrandDismissibleAlert
            v-else-if="aiCreditsFetchEnabled && aiCreditsLoadError"
            type="error"
            density="compact"
            alert-class="mb-3 brand-alert brand-alert--error"
            :close-label="t('common.close')"
          >
            {{ aiCreditsLoadError }}
          </BrandDismissibleAlert>

          <BrandAiAdoptionPanel
            v-if="showAiAdoptionCohorts && filteredAdoptionByPhase.length"
            :phases="filteredAdoptionByPhase"
          />

          <BrandUsersTopKpiRow
            :entries="topUserKpiEntries"
            :get-insight="getInsight"
            @select="openUserDetail"
          />

          <div class="brand-users-filters mb-2">
            <v-text-field
              v-model="selectedDay"
              class="brand-date-field brand-users-filters__date"
              :label="t('users.filterByDay')"
              type="date"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
            <v-autocomplete
              v-model="selectedUser"
              class="brand-users-filters__user"
              :items="userFilterOptions"
              :menu-props="brandSelectMenuProps"
              item-title="label"
              item-value="login"
              :label="t('users.filterUser')"
              :placeholder="t('common.allUsers')"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              prepend-inner-icon="mdi-account-filter"
            />
            <v-btn
              class="brand-users-filters__apply"
              color="primary"
              height="40"
              :loading="loading"
              @click="loadUsers"
            >
              {{ t('users.applyFilters') }}
            </v-btn>
            <p class="brand-users-filters__day-hint text-caption">
              {{ t('users.filterDayHint') }}
            </p>
          </div>

          <BrandTableShell
            :title="t('users.tableTitle')"
            :subtitle="tableSubtitle"
          >
            <BrandDismissibleAlert
              v-if="showAiAdoptionCohorts"
              storage-key="users-leaderboard-info"
              :close-label="t('common.close')"
            >
              <p class="text-body-2 mb-0">
                {{ adoptionLeaderboardNote }}
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
                    :display-name="item.name ?? undefined"
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
              <template #header.ai_credits="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colAiCredits')"
                  :tooltip="t('billing.colAiCreditsHint')"
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
              <template #header.user_initiated_interaction_count="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colInteractions')"
                  :tooltip="t('billing.colInteractionsHint')"
                />
              </template>
              <template #header.code_generation_activity_count="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colGenerations')"
                  :tooltip="t('billing.colGenerationsHint')"
                />
              </template>
              <template #header.code_acceptance_activity_count="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colAcceptances')"
                  :tooltip="t('billing.colAcceptancesHint')"
                />
              </template>
              <template #header.loc_added_sum="{ column, getSortIcon, toggleSort }">
                <BrandTableHeaderHint
                  :column="column"
                  :get-sort-icon="getSortIcon"
                  :toggle-sort="toggleSort"
                  :label="t('billing.colLocAdded')"
                  :tooltip="t('billing.colLocAddedHint')"
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
                  v-if="aiCreditsFetchEnabled && aiCreditsMeta?.available"
                  :credits="item.ai_credits"
                  :loading="isAiCreditsLoginLoading(item.user_login)"
                />
                <span v-else class="brand-credits-cell--na">{{ t('common.emDash') }}</span>
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

    <UserUsageDetailDialog
      v-model="detailDialogOpen"
      :user="detailUser"
      :usage-insight="detailUsageInsight"
      :report-range="detailReportRange"
      :billing-available="Boolean(aiCreditsMeta?.available)"
      :premium-credits-fetch-enabled="premiumCreditsFetchEnabled"
      :ai-credits-fetch-enabled="aiCreditsFetchEnabled"
      :team-slugs="[]"
    />
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
import BrandUserAvatar from '@/components/BrandUserAvatar.vue';
import UserUsageDetailDialog from '@/components/UserUsageDetailDialog.vue';
import type { UserUsageLeaderboardRow } from '../../shared/types/usage-insights';
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
  aiCredits?: {
    available: boolean;
    since?: string;
    until?: string;
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
import type { AiAdoptionPhaseAggregate } from '../../shared/types/copilot-usage'
import { usePremiumCreditsBatchLoader } from '@/composables/usePremiumCreditsBatchLoader'
import { usePremiumCreditsFeature } from '@/composables/usePremiumCreditsFeature'
import { useAiCreditsBatchLoader } from '@/composables/useAiCreditsBatchLoader'
import { useAiCreditsFeature } from '@/composables/useAiCreditsFeature'
import BrandAiCreditsCell from '@/components/BrandAiCreditsCell.vue'
import { PREMIUM_CREDITS_TABLE_DISABLED } from '../../shared/utils/premium-credits-feature'
import BrandUsagePatternChip from '@/components/BrandUsagePatternChip.vue'
import BrandUsersTopKpiRow from '@/components/BrandUsersTopKpiRow.vue'
import { useUsagePatternInsights } from '@/composables/useUsagePatternInsights'
import { activityInputFromUsageRecord } from '../../shared/utils/usage-pattern-insights'
import { pickTopUsersByCopilotQuality } from '../../shared/utils/users-top-kpi'

export default defineComponent({
  name: 'UserMetricsViewer',
  components: {
    BrandDismissibleAlert,
    BrandCollapsibleBillingAlert,
    BrandTableShell,
    BrandUserAvatar,
    UserUsageDetailDialog,
    BrandAiAdoptionPanel,
    BrandPageSkeleton,
    BrandUsagePatternChip,
    BrandUsersTopKpiRow,
    BrandAiCreditsCell,
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
    const { fetchEnabled: aiCreditsFetchEnabled } = useAiCreditsFeature();
    const { visible: showAiAdoptionCohorts } = useAiAdoptionCohortsFeature();
    const { ideOnly, filterPhases } = useAdoptionIdeOnly();
    const tabReportRange = useTabReportRange();
    const loading = ref(true);
    const error = ref<string | null>(null);
    const allUsers = ref<UserUsageRecord[]>([]);
    const adoptionByPhase = ref<AiAdoptionPhaseAggregate[]>([]);
    const filteredAdoptionByPhase = computed(() => filterPhases(adoptionByPhase.value));
    const adoptionLeaderboardNote = computed(() =>
      t.value(ideOnly.value ? 'adoption.leaderboardColumnNoteIdeOnly' : 'adoption.leaderboardColumnNote')
    );
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

    const usageCohortInputs = computed(() =>
      allUsers.value.map((u) => activityInputFromUsageRecord(u))
    );
    const { getInsight } = useUsagePatternInsights(usageCohortInputs);

    const topUserKpiEntries = computed(() =>
      pickTopUsersByCopilotQuality(allUsers.value, (row) => ({
        login: row.user_login,
        insight: getInsight(row.user_login),
        interactions: row.user_initiated_interaction_count ?? 0,
        generations: row.code_generation_activity_count ?? 0,
        acceptances: row.code_acceptance_activity_count ?? 0,
        locAdded: row.loc_added_sum ?? 0
      }))
    )

    const premiumCreditsMeta = ref<UserMetricsApiResponse['premiumCredits']>();
    const aiCreditsMeta = ref<UserMetricsApiResponse['aiCredits']>();
    const checkingBillingStatus = ref(false);

    const {
      premiumLoading,
      premiumLoadProgress,
      premiumLoadError,
      loadPremiumCreditsInBackground,
      cancelPremiumCreditsLoad,
      isPremiumLoginLoading
    } = usePremiumCreditsBatchLoader(allUsers);

    const {
      aiCreditsLoading,
      aiCreditsLoadProgress,
      aiCreditsLoadError,
      loadAiCreditsInBackground,
      cancelAiCreditsLoad,
      isAiCreditsLoginLoading
    } = useAiCreditsBatchLoader(allUsers);

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

    const detailDialogOpen = ref(false);
    const detailUser = ref<UserUsageLeaderboardRow | null>(null);

    const detailReportRange = computed(() => reportRange.value || props.dateRangeDescription || '');

    const detailUsageInsight = computed(() =>
      detailUser.value ? getInsight(detailUser.value.user_login) : undefined
    );

    const toDetailUser = (row: UserUsageRecord): UserUsageLeaderboardRow => ({
      user_login: row.user_login,
      user_id: row.user_id,
      name: row.name,
      email: row.email,
      interactions: row.user_initiated_interaction_count ?? 0,
      generations: row.code_generation_activity_count ?? 0,
      acceptances: row.code_acceptance_activity_count ?? 0,
      locAdded: row.loc_added_sum ?? 0,
      modelCount: row.totals_by_model_feature?.length ?? 0,
      used_agent: !!row.used_agent,
      used_chat: !!row.used_chat,
      used_cli: !!row.used_cli,
      used_code_review: !!(row.used_copilot_code_review_active || row.used_copilot_code_review_passive),
      ai_adoption_phase: row.ai_adoption_phase,
      totals_by_model_feature: row.totals_by_model_feature,
      totals_by_feature: row.totals_by_feature,
      premium_credits: row.premium_credits,
      ai_credits: row.ai_credits
    });

    const openUserDetail = (row: UserUsageRecord) => {
      const login = row?.user_login;
      if (!login) return;
      detailUser.value = toDetailUser(row);
      detailDialogOpen.value = true;
    };

    const headers = computed(() => {
      const patternSortRaw = (a: UserUsageRecord, b: UserUsageRecord) => {
        const pa = getInsight(a.user_login)?.patternId ?? '';
        const pb = getInsight(b.user_login)?.patternId ?? '';
        return pa.localeCompare(pb);
      };
      return [
        { title: t.value('billing.colUser'), key: 'user_login', minWidth: '200px' },
        { title: t.value('billing.colUsage'), key: 'usageDetail', sortable: false, align: 'end' as const, width: '120px' },
        {
          title: t.value('usagePattern.colPattern'),
          key: 'usage_pattern',
          sortable: true,
          sortRaw: patternSortRaw,
          minWidth: '160px'
        },
        ...(aiCreditsFetchEnabled.value
          ? [{
              title: t.value('billing.colAiCredits'),
              key: 'ai_credits',
              align: 'end' as const,
              sortable: true,
              sortRaw: (a: UserUsageRecord, b: UserUsageRecord) =>
                (a.ai_credits?.used ?? -1) - (b.ai_credits?.used ?? -1)
            }]
          : []),
        {
          title: t.value('billing.colInteractions'),
          key: 'user_initiated_interaction_count',
          align: 'end' as const
        },
        {
          title: t.value('billing.colGenerations'),
          key: 'code_generation_activity_count',
          align: 'end' as const
        },
        {
          title: t.value('billing.colAcceptances'),
          key: 'code_acceptance_activity_count',
          align: 'end' as const
        },
        { title: t.value('billing.colLocAdded'), key: 'loc_added_sum', align: 'end' as const },
        { title: t.value('billing.colAgent'), key: 'used_agent', align: 'center' as const },
        { title: t.value('billing.colChat'), key: 'used_chat', align: 'center' as const }
      ];
    });

    const formatNum = (n?: number) => (n ?? 0).toLocaleString();

    const loadUsers = async () => {
      loading.value = true;
      error.value = null;
      premiumCreditsMeta.value = undefined;
      aiCreditsMeta.value = undefined;
      cancelPremiumCreditsLoad();
      cancelAiCreditsLoad();

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
        aiCreditsMeta.value = response.aiCredits;
        selectedUser.value = null;

        if (response.reportDay) {
          reportRange.value = t.value('users.reportDay', { day: response.reportDay });
        } else if (response.reportStartDay && response.reportEndDay) {
          reportRange.value = `${response.reportStartDay} → ${response.reportEndDay}`;
        } else {
          reportRange.value = null;
        }

        const logins = (response.users || []).map((u) => u.user_login);

        if (
          !PREMIUM_CREDITS_TABLE_DISABLED &&
          premiumCreditsFetchEnabled.value &&
          response.premiumCredits?.available &&
          !response.premiumCredits.fetchDisabled
        ) {
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

        if (
          aiCreditsFetchEnabled.value &&
          response.aiCredits?.available &&
          !response.aiCredits.fetchDisabled
        ) {
          void loadAiCreditsInBackground({
            logins,
            since: response.aiCredits.since,
            until: response.aiCredits.until,
            day: selectedDay.value,
            billingAvailable: true
          }).then(() => {
            if (aiCreditsMeta.value) {
              const withAi = allUsers.value.filter(
                (u) => u.ai_credits?.source === 'billing' && (u.ai_credits?.used ?? 0) > 0
              ).length;
              aiCreditsMeta.value = {
                ...aiCreditsMeta.value,
                perUserDataAvailable: withAi > 0,
                usersWithBillingData: withAi
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
      cancelAiCreditsLoad();
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
      filteredAdoptionByPhase,
      adoptionLeaderboardNote,
      showAiAdoptionCohorts,
      displayedUsers,
      userFilterOptions,
      headers,
      premiumCreditsFetchEnabled,
      aiCreditsFetchEnabled,
      PREMIUM_CREDITS_TABLE_DISABLED,
      premiumCreditsMeta,
      aiCreditsMeta,
      aiCreditsLoading,
      aiCreditsLoadProgress,
      aiCreditsLoadError,
      isAiCreditsLoginLoading,
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
      detailDialogOpen,
      detailUser,
      detailUsageInsight,
      detailReportRange,
      getInsight,
      topUserKpiEntries,
      openUserDetail,
      t
    };
  }
});
</script>
