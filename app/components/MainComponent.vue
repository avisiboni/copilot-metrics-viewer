<template>
  <v-navigation-drawer
      v-model="sidebarOpen"
      :rail="sidebarRail"
      permanent
      app
      class="brand-nav-drawer"
      width="240"
      rail-width="56"
    >
      <div v-if="!sidebarRail" class="brand-nav-drawer__head pa-2 d-flex align-center">
        <img
          :src="brandLogoSrc"
          :alt="brandLogoAlt"
          class="brand-nav-drawer__logo"
        >
        <v-btn
          icon
          variant="text"
          size="small"
          class="ms-auto"
          :aria-label="t('header.collapseSidebar')"
          @click="collapseSidebarToRail"
        >
          <v-icon>{{ collapseChevronIcon }}</v-icon>
        </v-btn>
      </div>

      <v-list nav density="compact" class="brand-nav-list">
        <v-list-item
          v-for="item in tabItems"
          :key="item"
          :to="tabLink(item)"
          :title="tabLabel(item)"
          :value="item"
          :active="tab === item"
          rounded="lg"
        >
          <template #prepend>
            <v-icon :icon="tabIcon(item)" size="small" />
          </template>
        </v-list-item>
      </v-list>
  </v-navigation-drawer>

  <v-app-bar app flat density="compact" class="brand-app-bar" elevation="0">
      <v-btn
        v-if="sidebarRail"
        icon
        variant="text"
        size="small"
        class="me-1"
        :aria-label="t('header.expandSidebar')"
        @click="expandSidebar"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-app-bar-title class="brand-app-bar__title text-truncate">
        {{ displayName }}
      </v-app-bar-title>
      <v-chip
        v-if="mockedDataMessage"
        size="x-small"
        variant="outlined"
        color="warning"
        class="ms-2 d-none d-md-inline-flex"
      >
        {{ t('header.mockData') }}
      </v-chip>
      <v-spacer />
      <LanguageSwitcher class="brand-app-bar__locale d-none d-sm-flex" />
      <AuthState>
        <template #default="{ loggedIn, user }">
          <span v-if="loggedIn && !sidebarRail" class="brand-app-bar__user text-truncate d-none d-sm-inline">
            {{ user?.name }}
          </span>
          <v-avatar v-if="loggedIn" size="28" class="ms-2">
            <v-img :alt="user?.name" :src="user?.avatarUrl" />
          </v-avatar>
          <v-btn
            v-if="showLogoutButton && loggedIn"
            variant="text"
            size="small"
            class="ms-1"
            @click="logout"
          >
            {{ t('header.logout') }}
          </v-btn>
        </template>
      </AuthState>
  </v-app-bar>

  <v-main app class="app-shell__main">
    <div class="app-shell__page">
      <DateRangeSelector
        v-show="tab !== 'seat analysis' && !signInRequired"
        :loading="isLoading"
        :report-range="tabReportRange"
        :billing-range="tabBillingRange"
        @date-range-changed="handleDateRangeChange"
      />

      <v-card
        v-if="tab === 'seat analysis'"
        flat
        class="mb-2 pa-2 brand-info-banner text-caption text-center"
      >
        {{ t('header.seatsBanner', { name: displayName }) }}
      </v-card>

      <BrandDismissibleAlert
        v-if="apiError && !signInRequired"
        type="error"
        variant="outlined"
        density="compact"
        wrapper-class="mb-2"
        alert-class="brand-alert brand-alert--error"
        :close-label="t('common.close')"
      >
        {{ apiError }}
      </BrandDismissibleAlert>

      <AuthState>
        <template #default="{ loggedIn }">
          <div v-show="signInRequired" class="github-login-container">
            <NuxtLink
              v-if="!loggedIn && signInRequired"
              to="/auth/github"
              external
              class="github-login-button"
            >
              <v-icon start>mdi-github</v-icon>
              {{ t('header.signInGithub') }}
            </NuxtLink>
          </div>
        </template>
        <template #placeholder>
          <div class="github-login-container">
            <v-skeleton-loader type="button" width="200" />
          </div>
        </template>
      </AuthState>

      <div v-show="!apiError" class="app-shell__body">
        <BrandPageSkeleton
          v-if="showTabSkeleton"
          :layout="skeletonLayout"
          :aria-label="t('alerts.loadingTab', { tab: tabLabel(tab || '') })"
        />
        <v-window
          v-show="showTabContent"
          v-model="tab"
        >
          <v-window-item v-for="item in tabItems" :key="item" :value="item">
            <keep-alive>
              <v-card flat>
                <MetricsViewer
                  v-if="item === getDisplayTabName(itemName)"
                  :metrics="metrics"
                  :usage="originalMetrics"
                  :adoption-by-phase="adoptionByPhase"
                  :date-range-description="dateRangeDescription"
                />
                <TeamsComponent
                  v-if="item === 'teams'"
                  :date-range-description="dateRangeDescription"
                  :date-range="dateRange"
                />
                <BreakdownComponent
                  v-if="item === 'languages'"
                  :metrics="metrics"
                  breakdown-key="language"
                  :date-range-description="dateRangeDescription"
                />
                <BreakdownComponent
                  v-if="item === 'editors'"
                  :metrics="metrics"
                  breakdown-key="editor"
                  :date-range-description="dateRangeDescription"
                />
                <CopilotChatViewer
                  v-if="item === 'copilot chat'"
                  :metrics="metrics"
                  :usage="originalMetrics"
                  :date-range-description="dateRangeDescription"
                />
                <AgentModeViewer
                  v-if="item === 'usage insights'"
                  :original-metrics="originalMetrics"
                  :date-range="dateRange"
                  :date-range-description="dateRangeDescription"
                  :adoption-by-phase="adoptionByPhase"
                />
                <UserMetricsViewer
                  v-if="item === 'users'"
                  :date-range="dateRange"
                  :date-range-description="dateRangeDescription"
                />
                <UsageBillingViewer
                  v-if="item === 'usage & billing'"
                  :date-range="dateRange"
                  :date-range-description="dateRangeDescription"
                  :seats="seats"
                />
                <SeatsAnalysisViewer v-if="item === 'seat analysis'" :seats="seats" />
                <ApiResponse
                  v-if="item === 'api response'"
                  :metrics="metrics"
                  :original-metrics="originalMetrics"
                  :seats="seats"
                />
              </v-card>
            </keep-alive>
          </v-window-item>
          <BrandDismissibleAlert
            v-show="(metricsReady && metrics.length == 0 && tab !== 'seat analysis') || (seatsReady && seats.length == 0 && tab === 'seat analysis')"
            type="warning"
            density="compact"
            wrapper-class="ma-3"
            alert-class="brand-alert brand-alert--warning"
            :close-label="t('common.close')"
            :title="t('alerts.noDataTitle')"
          >
            {{ t('alerts.noDataText') }}
          </BrandDismissibleAlert>
        </v-window>
      </div>
    </div>
  </v-main>

  <AiChatPanel
    v-if="config?.public?.enableAiChat === true"
    :current-tab="tab"
    :query-params="aiChatQueryParams"
    :metrics="metrics"
    :seats="seats"
    :total-seats="seats.length"
  />
</template>
<script lang='ts'>
import type { Metrics } from '@/model/Metrics';
import type { CopilotMetrics } from '@/model/Copilot_Metrics';
import type { AiAdoptionPhaseAggregate } from '../../shared/types/copilot-usage';
import type { MetricsApiResponse } from '@/types/metricsApiResponse';
import type { Seat } from "@/model/Seat";
import type { H3Error } from 'h3'

//Components
import MetricsViewer from './MetricsViewer.vue'
import BreakdownComponent from './BreakdownComponent.vue'
import CopilotChatViewer from './CopilotChatViewer.vue'
import SeatsAnalysisViewer from './SeatsAnalysisViewer.vue'
import TeamsComponent from './TeamsComponent.vue'
import ApiResponse from './ApiResponse.vue'
import AgentModeViewer from './AgentModeViewer.vue'
import DateRangeSelector from './DateRangeSelector.vue'
import UserMetricsViewer from './UserMetricsViewer.vue'
import UsageBillingViewer from './UsageBillingViewer.vue'
import BrandPageSkeleton from './BrandPageSkeleton.vue'
import BrandDismissibleAlert from './BrandDismissibleAlert.vue'
import AiChatPanel from './AiChatPanel.vue'
import type { SeatsApiResponse } from '#server/api/seats';
import { applyHiddenTabs, applyHistoricalModeFilter } from '@/utils/tabUtils';
import { Options } from '@/model/Options';
import { useRoute } from 'vue-router';
import { isEnvTruthy } from '../../shared/utils/env-boolean';
import { buildPageTitle } from '../../shared/i18n/buildPageTitle';
import { resolveTabFromSlug, tabToSlug } from '../../shared/utils/tab-routing';
import { provideTabReportRange } from '@/composables/useTabReportRange';
import {
  tabToSkeletonLayout,
  tabUsesMainMetricsLoading,
  tabUsesSeatsLoading
} from '@/utils/tab-skeleton-layout';

const TAB_ICONS: Record<string, string> = {
  organization: 'mdi-office-building-outline',
  enterprise: 'mdi-domain',
  team: 'mdi-account-group-outline',
  teams: 'mdi-account-multiple-outline',
  languages: 'mdi-code-tags',
  editors: 'mdi-application-outline',
  'copilot chat': 'mdi-chat-outline',
  'usage insights': 'mdi-chart-timeline-variant',
  users: 'mdi-account-outline',
  'usage & billing': 'mdi-currency-usd',
  'seat analysis': 'mdi-seat-outline',
  'api response': 'mdi-code-json'
};

export default defineNuxtComponent({
  name: 'MainComponent',
  components: {
    MetricsViewer,
    BreakdownComponent,
    CopilotChatViewer,
    SeatsAnalysisViewer,
    TeamsComponent,
    ApiResponse,
    AgentModeViewer,
    DateRangeSelector,
    UserMetricsViewer,
    UsageBillingViewer,
    BrandPageSkeleton,
    BrandDismissibleAlert,
    AiChatPanel
  },
  computed: {
    skeletonLayout() {
      return tabToSkeletonLayout(this.tab);
    },
    showTabSkeleton() {
      if (this.signInRequired) return false;
      if (tabUsesSeatsLoading(this.tab)) {
        return !this.seatsReady;
      }
      if (tabUsesMainMetricsLoading(this.tab)) {
        return !this.metricsReady || this.isLoading;
      }
      return false;
    },
    showTabContent() {
      if (this.showTabSkeleton) return false;
      if (this.tab === 'seat analysis') {
        return this.seatsReady;
      }
      return this.metricsReady && this.metrics.length > 0;
    }
  },
  methods: {
    logout() {
      const { clear } = useUserSession()
      this.metrics = [];
      this.seats = [];
      clear();
    },
    tabLink(tab: string) {
      return {
        path: this.route.path,
        query: {
          ...this.route.query,
          tab: tabToSlug(tab)
        }
      };
    },
    tabIcon(tab: string) {
      return TAB_ICONS[tab] || 'mdi-chart-line';
    },
    syncTabFromRoute() {
      const slug = this.route.query.tab;
      const resolved = resolveTabFromSlug(
        typeof slug === 'string' ? slug : undefined,
        this.tabItems
      );
      if (resolved) {
        this.tab = resolved;
        return;
      }
      if (this.tabItems.length) {
        this.tab = this.tabItems[0];
        this.updateTabQuery(this.tab);
      }
    },
    updateTabQuery(tab: string) {
      const nextSlug = tabToSlug(tab);
      const currentSlug = typeof this.route.query.tab === 'string' ? this.route.query.tab : '';
      if (currentSlug === nextSlug) return;
      this.router.replace({
        path: this.route.path,
        query: {
          ...this.route.query,
          tab: nextSlug
        }
      });
    },
    getDisplayTabName(itemName: string): string {
      // Transform scope names to display names for tabs
      switch (itemName) {
        case 'team-organization':
        case 'team-enterprise':
          return 'team';
        case 'organization':
        case 'enterprise':
          return itemName;
        default:
          return itemName;
      }
    },
    async handleDateRangeChange(newDateRange: { 
      since?: string; 
      until?: string; 
      description: string;
      excludeHolidays?: boolean;
    }) {
      this.dateRangeDescription = newDateRange.description;
      this.dateRange = {
        since: newDateRange.since,
        until: newDateRange.until
      };

      // Store holiday options
      this.holidayOptions = {
        excludeHolidays: newDateRange.excludeHolidays,
      };

      await this.fetchMetrics();
    },
    async fetchMetrics() {
      if (this.signInRequired || !this.dateRange.since || !this.dateRange.until || this.isLoading) {
        return;
      }
      const config = useRuntimeConfig();

      this.isLoading = true;
      // Clear previous API errors when making a new request
      this.apiError = undefined;

      try {
        const options = Options.fromRoute(this.route, this.dateRange.since, this.dateRange.until);
        
        // Add holiday options if they're set
        if (this.holidayOptions?.excludeHolidays) {
          options.excludeHolidays = this.holidayOptions.excludeHolidays;
        }
        
        const params = options.toParams();

        const queryString = new URLSearchParams(params).toString();
        const apiUrl = queryString ? `/api/metrics?${queryString}` : '/api/metrics';

        const response = await $fetch(apiUrl) as MetricsApiResponse;

        this.metrics = response.metrics || [];
        this.originalMetrics = response.usage || [];
        this.adoptionByPhase = response.adoptionByPhase || [];
        this.metricsReady = true;

        if (config.public.scope && config.public.scope.includes('team') && this.metrics.length === 0 && !this.apiError) {
          this.apiError = (this.t as (key: string) => string)('errors.noTeamData');
        }

        if (!options.locale && this.apiLocale) {
          options.locale = this.apiLocale;
        }

      } catch (error: any) {
        this.processError(error);
      } finally {
        this.isLoading = false;
      }
    },
    processError(error: H3Error) {
      console.error(error || 'No data returned from API');
      const translate = this.t as (key: string, params?: Record<string, string | number>) => string
      if (error && error.statusCode) {
        switch (error.statusCode) {
          case 401:
            this.apiError = translate('errors.unauthorized');
            break;
          case 404:
            this.apiError = translate('errors.notFound', {
              scope: this.config?.public?.scope || '',
              org: this.config?.public?.githubOrg || '',
              ent: this.config?.public?.githubEnt || '',
              team: this.config?.public?.githubTeam || '',
              message: error.message || '',
            });
            break;
          case 422:
            this.apiError = translate('errors.unprocessable', { message: error.message || '' });
            break;
          case 500:
            this.apiError = translate('errors.serverError', { message: error.message || '' });
            break;
          default:
            this.apiError = translate('errors.generic', {
              status: error.statusCode,
              message: error.message || '',
            });
            break;
        }
      }
    }
  },

  data() {
    return {
      tabItems: [
        'copilot chat',
        'users',
        'usage & billing',
        'seat analysis',
        'usage insights',
        'languages',
        'editors',
        'api response',
      ],
      tab: null,
      dateRangeDescription: '',
      metricsReady: false,
      metrics: [] as Metrics[],
      originalMetrics: [] as CopilotMetrics[],
      adoptionByPhase: [] as AiAdoptionPhaseAggregate[],
      seatsReady: false,
      seats: [] as Seat[],
      apiError: undefined as string | undefined,
      config: null as ReturnType<typeof useRuntimeConfig> | null,
      unwatchTabQuery: undefined as (() => void) | undefined,
      holidayOptions: {
        excludeHolidays: false,
      }
    }
  },
  created() {
    this.tabItems.unshift(this.getDisplayTabName(this.itemName));
    
    // Add teams tab for organization and enterprise scopes (after Usage insights)
    if (this.itemName === 'organization' || this.itemName === 'enterprise') {
      const insightsIdx = this.tabItems.indexOf('usage insights');
      this.tabItems.splice(insightsIdx + 1, 0, 'teams');
    }

    this.config = useRuntimeConfig();
    this.tabItems = applyHiddenTabs(
      this.tabItems,
      String(this.config.public.hiddenTabs || '')
    );
    this.tabItems = applyHistoricalModeFilter(
      this.tabItems,
      this.config.public.enableHistoricalMode
    );
    this.syncTabFromRoute();
  },
  async mounted() {
    this.unwatchTabQuery = this.$watch(
      () => this.route.query.tab,
      () => {
        const slug = this.route.query.tab;
        const resolved = resolveTabFromSlug(
          typeof slug === 'string' ? slug : undefined,
          this.tabItems
        );
        if (resolved && resolved !== this.tab) {
          this.tab = resolved;
        }
      }
    );

    this.$watch('tab', (tab: string) => {
      const reportTabs = ['users', 'usage & billing'];
      if (!reportTabs.includes(tab)) {
        if (this.tabReportRange) this.tabReportRange = null;
        if (this.tabBillingRange) this.tabBillingRange = null;
      }
    });

    // Load initial data
    try {

      await this.fetchMetrics();

      const { data: seatsData, error: seatsError, execute: executeSeats } = this.seatsFetch;

      if (!this.signInRequired) {
        await executeSeats();

        if (seatsError.value) {
          this.processError(seatsError.value as H3Error);
        } else {
          const resp = seatsData.value as SeatsApiResponse | Seat[] | null;
          if (Array.isArray(resp)) {
            this.seats = resp;
          } else if (resp?.seats) {
            this.seats = resp.seats;
          } else {
            this.seats = [];
          }
          this.seatsReady = true;
        }
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  },
  setup() {
    const { loggedIn, user } = useUserSession()
    const config = useRuntimeConfig();
    const branding = useAppBranding();
    const brandLogoSrc = computed(() => branding.value.logoSrc);
    const brandLogoAlt = computed(() => branding.value.logoAlt);
    const showLogoutButton = computed(() => {
      const providers = String(config.public.authProviders || '').trim();
      return (config.public.usingGithubAuth || !!providers) && loggedIn.value;
    });
    const { t, tabLabel, apiLocale, isRtl } = useAppI18n()
    const collapseChevronIcon = computed(() =>
      isRtl.value ? 'mdi-chevron-right' : 'mdi-chevron-left'
    )
    const mockedDataMessage = computed(() =>
      isEnvTruthy(config.public.isDataMocked) ? t.value('header.mockDataHint') : ''
    );
    const itemName = computed(() => config.public.scope);
    const displayName = computed(() =>
      buildPageTitle(t.value, config.public, branding.value.appName),
    );
    const dateRange = ref({ since: undefined as string | undefined, until: undefined as string | undefined });
    const isLoading = ref(false);
    const route = useRoute();
    const router = useRouter();

    const signInRequired = computed(() => {
      const providers = String(config.public.authProviders || '').trim();
      const isAuthRequired =
        config.public.requireAuth
        || config.public.usingGithubAuth
        || config.public.isPublicApp
        || !!providers;
      return isAuthRequired && !loggedIn.value;
    });

    const seatsFetch = useFetch('/api/seats', {
      server: true,
      immediate: !signInRequired.value,
      query: computed(() => {
        const options = Options.fromRoute(route);
        return options.toParams();
      })
    });

    const { reportRange: tabReportRange, billingRange: tabBillingRange } = provideTabReportRange();
    const sidebarOpen = ref(true);
    const sidebarRail = ref(false);

    const expandSidebar = () => {
      sidebarRail.value = false;
      sidebarOpen.value = true;
    };
    const collapseSidebarToRail = () => {
      sidebarRail.value = true;
      sidebarOpen.value = true;
    };

    const aiChatQueryParams = computed(() => {
      const options = Options.fromRoute(route, dateRange.value.since, dateRange.value.until);
      return {
        scope: options.scope,
        githubOrg: options.githubOrg,
        githubEnt: options.githubEnt,
        since: dateRange.value.since,
        until: dateRange.value.until,
      };
    });

    return {
      brandLogoSrc,
      brandLogoAlt,
      t,
      tabLabel,
      apiLocale,
      collapseChevronIcon,
      showLogoutButton,
      mockedDataMessage,
      itemName,
      displayName,
      signInRequired,
      user,
      seatsFetch,
      dateRange,
      isLoading,
      route,
      router,
      tabReportRange,
      tabBillingRange,
      sidebarOpen,
      sidebarRail,
      expandSidebar,
      collapseSidebarToRail,
      config,
      aiChatQueryParams,
    };
  },
})
</script>

<style scoped>
.app-shell__body {
  min-height: 200px;
}

.brand-app-bar__title {
  font-size: 0.9rem !important;
  font-weight: 600;
}

.brand-app-bar__user {
  font-size: 0.8125rem;
  max-width: 140px;
  color: var(--brand-text);
}

.github-login-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.github-login-button {
  display: flex;
  align-items: center;
  background-color: #24292e;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
}

.github-login-button:hover {
  background-color: #444d56;
}
</style>