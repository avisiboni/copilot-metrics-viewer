<template>
  <div>
    <BrandPageSkeleton
      v-if="teamsInitialLoading"
      layout="teams"
      :aria-label="t('teams.loading')"
    />

    <template v-else>
    <!-- Team Selection Section -->
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4">
            <v-card-title class="text-h5">
              {{ t('teams.title') }}
            </v-card-title>
            <v-card-subtitle>
              {{ t('teams.subtitle', { scope: scopeType }) }}
            </v-card-subtitle>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="8">
                  <v-autocomplete
v-model="selectedTeams" :items="availableTeams" item-value="slug" item-title="name"
                    :label="t('teams.searchLabel')" multiple chips clearable variant="outlined" :menu-props="{
                      contentClass: 'teams-select-menu',
                      maxHeight: 360,
                      scrim: false,
                      closeOnContentClick: false,
                      offset: 8
                    }" :hint="t('teams.searchHint', { scope: scopeType })" persistent-hint>
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.description" />
                    </template>
                    <template #chip="{ props, item }">
                      <v-chip v-bind="props" class="select-chip" :text="item.raw.name" closable />
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="12" md="4" class="d-flex align-center">
                  <v-btn
v-if="selectedTeams.length > 0" color="primary" variant="outlined" size="small"
                    @click="clearSelection">
                    {{ t('teams.clearAll') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Selected Teams Quick Links -->
    <v-container v-if="selectedTeamObjects.length > 0">
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4">
            <v-card-title class="text-h6">{{ t('teams.selectedTeams') }}</v-card-title>
            <v-card-text>
              <v-chip-group>
                <v-chip
v-for="team in selectedTeamObjects" :key="team.slug" :href="getTeamDetailUrl(team.slug)"
                  class="selected-team-chip" target="_blank" link>
                  {{ team.name }} - {{ t('teams.viewDetails') }}
                  <v-icon end>mdi-open-in-new</v-icon>
                </v-chip>
              </v-chip-group>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Charts and Metrics Display -->
    <div v-if="selectedTeams.length > 0">
      <template v-if="teamMetricsLoading">
        <BrandKpiTilesSkeleton :count="2" />
        <section class="brand-page-panel">
          <BrandChartSkeleton v-for="n in 4" :key="`teams-chart-${n}`" />
        </section>
      </template>
      <template v-else>
      <!-- Summary Cards -->
      <div class="tiles-container">
        <v-card variant="flat" class="brand-kpi-card">
          <BrandKpiTooltip :text="t('teams.kpiTooltipTeams')" />
          <v-card-item>
            <div class="tiles-text">
              <div class="spacing-25" />
              <div class="text-h6 mb-1">{{ t('teams.teamsSelected') }}</div>
              <div class="text-caption">{{ dateRangeDesc }}</div>
              <p class="text-h4">{{ selectedTeams.length }}</p>
            </div>
          </v-card-item>
        </v-card>

        <v-card variant="flat" class="brand-kpi-card">
          <BrandKpiTooltip :text="t('teams.kpiTooltipUsers')" />
          <v-card-item>
            <div class="tiles-text">
              <div class="spacing-10" />
              <div class="text-h6 mb-1">{{ t('teams.totalActiveUsers') }}</div>
              <div class="text-caption">{{ dateRangeDesc }}</div>
              <p class="text-h4">{{ totalActiveUsers }}</p>
            </div>
          </v-card-item>
        </v-card>
      </div>

      <!-- Charts Section -->
      <section class="brand-page-panel">
          <BrandChartTitle
            :title="t('teams.chartAcceptanceCount')"
            :tooltip="chartTooltips.teamsAcceptanceRateByCount"
          />
          <LineChart :data="acceptanceRateCountChartData" :options="chartOptions" />

          <BrandChartTitle
            :title="t('teams.chartSuggestions')"
            :tooltip="chartTooltips.teamsTotalSuggestions"
          />
          <LineChart :data="suggestionsAcceptancesChartData" :options="chartOptions" />

          <BrandChartTitle
            :title="t('teams.chartAcceptanceLines')"
            :tooltip="chartTooltips.teamsAcceptanceRateByLines"
          />
          <LineChart :data="acceptanceRateLinesChartData" :options="chartOptions" />

          <BrandChartTitle
            :title="t('teams.chartLines')"
            :tooltip="chartTooltips.teamsLinesSuggestedAccepted"
          />
          <LineChart :data="linesSuggestedAcceptedChartData" :options="chartOptions" />

          <BrandChartTitle
            :title="t('teams.chartActiveUsers')"
            :tooltip="chartTooltips.teamsActiveUsers"
          />
          <LineChart :data="activeUsersChartData" :options="chartOptions" />

          <BrandChartTitle
            :title="t('teams.chartIdeCompletions')"
            :tooltip="chartTooltips.teamsIdeCompletions"
          />
          <LineChart :data="ideCompletionsChartData" :options="chartOptions" />

          <BrandChartTitle
            :title="t('teams.chartIdeChat')"
            :tooltip="chartTooltips.teamsIdeChat"
          />
          <LineChart :data="ideChatChartData" :options="chartOptions" />

          <BrandChartTitle
            :title="t('teams.chartDotcomChat')"
            :tooltip="chartTooltips.teamsDotcomChat"
          />
          <LineChart :data="githubChatChartData" :options="chartOptions" />

          <BrandChartTitle
            :title="t('teams.chartDotcomPr')"
            :tooltip="chartTooltips.teamsDotcomPr"
          />
          <LineChart :data="githubPrChartData" :options="chartOptions" />
      </section>

      <!-- Language and Editor Comparison Charts -->
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="pa-4">
              <v-card-title class="pa-4 pb-0">
                <BrandChartTitle
                  :title="t('teams.chartLanguage')"
                  :tooltip="chartTooltips.teamsLanguageUsage"
                  heading-tag="div"
                  heading-class="text-h6"
                />
              </v-card-title>
              <v-card-text>
                <div v-if="languageBarChartData.datasets.length > 0" class="bar-chart-container">
                  <BarChart :data="languageBarChartData" :options="barChartOptions" />
                </div>
                <div v-else class="text-center text-medium-emphasis py-8">
                  <v-icon size="48" color="grey-lighten-1">mdi-chart-bar</v-icon>
                  <p class="mt-2">{{ t('teams.noLanguageData') }}</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="pa-4">
              <v-card-title class="pa-4 pb-0">
                <BrandChartTitle
                  :title="t('teams.chartEditor')"
                  :tooltip="chartTooltips.teamsEditorUsage"
                  heading-tag="div"
                  heading-class="text-h6"
                />
              </v-card-title>
              <v-card-text>
                <div v-if="editorBarChartData.datasets.length > 0" class="bar-chart-container">
                  <BarChart :data="editorBarChartData" :options="barChartOptions" />
                </div>
                <div v-else class="text-center text-medium-emphasis py-8">
                  <v-icon size="48" color="grey-lighten-1">mdi-chart-bar</v-icon>
                  <p class="mt-2">{{ t('teams.noEditorData') }}</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      </template>
    </div>

    <!-- Empty State -->
    <v-container v-else>
      <v-row>
        <v-col cols="12">
          <v-card class="text-center pa-8">
            <v-card-text>
              <v-icon size="64" color="grey-lighten-1">mdi-account-group-outline</v-icon>
              <h3 class="text-h5 mt-4 mb-2">{{ t('teams.noTeamsTitle') }}</h3>
              <p class="text-body-1 text-medium-emphasis">
                {{ t('teams.noTeamsText') }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, type PropType } from 'vue'
import { Line as LineChart, Bar as BarChart } from 'vue-chartjs'
import { Options } from '@/model/Options'
import type { ChartData, ChartDataset } from 'chart.js'
import type { MetricsApiResponse } from '@/types/metricsApiResponse';
import type { Metrics } from '@/model/Metrics';
import type { CopilotMetrics } from '@/model/Copilot_Metrics';
import { brandChartPalette } from '@/utils/brand-colors';
import { brandBarChartOptionsWithLegend, brandLineChartOptions } from '@/utils/chart-theme';
import BrandPageSkeleton from '@/components/BrandPageSkeleton.vue';
import { useChartTooltips } from '@/utils/chart-tooltips';
import BrandKpiTilesSkeleton from '@/components/BrandKpiTilesSkeleton.vue';
import BrandChartSkeleton from '@/components/BrandChartSkeleton.vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface DateRange { since?: string; until?: string }

interface Team {
  name: string
  slug: string
  description?: string
}

interface LanguageTeamData { team: string; language: string; acceptance_rate: number }
interface EditorTeamData { team: string; editor: string; active_users: number }

// Keys we will chart from the legacy Metrics object mapping
type LineMetricKey = 'acceptance_rate_by_count' | 'acceptance_rate_by_lines' | 'total_suggestions_count' | 'total_acceptances_count' | 'total_lines_suggested' | 'total_lines_accepted' | 'total_active_users'

export default defineComponent({
  name: 'TeamsComponent',
  components: { LineChart, BarChart, BrandPageSkeleton, BrandKpiTilesSkeleton, BrandChartSkeleton },
  props: {
    dateRange: { type: Object as PropType<DateRange>, required: false, default: () => ({}) },
    dateRangeDescription: { type: String, default: '' }
  },
  setup(props) {
    const chartTooltips = useChartTooltips()
    const { t } = useAppI18n()
    const availableTeams = ref<Team[]>([])
    const selectedTeams = ref<string[]>([])

    const acceptanceRateCountChartData = ref<ChartData<'line', number[], string>>({ labels: [], datasets: [] })
    const suggestionsAcceptancesChartData = ref<ChartData<'line', number[], string>>({ labels: [], datasets: [] })
    const acceptanceRateLinesChartData = ref<ChartData<'line', number[], string>>({ labels: [], datasets: [] })
    const linesSuggestedAcceptedChartData = ref<ChartData<'line', number[], string>>({ labels: [], datasets: [] })
    const activeUsersChartData = ref<ChartData<'line', number[], string>>({ labels: [], datasets: [] })
    const ideCompletionsChartData = ref<ChartData<'line', number[], string>>({ labels: [], datasets: [] })
    const ideChatChartData = ref<ChartData<'line', number[], string>>({ labels: [], datasets: [] })
    const githubChatChartData = ref<ChartData<'line', number[], string>>({ labels: [], datasets: [] })
    const githubPrChartData = ref<ChartData<'line', number[], string>>({ labels: [], datasets: [] })

    const languageComparison = ref<LanguageTeamData[]>([])
    const editorComparison = ref<EditorTeamData[]>([])
    const languageBarChartData = ref<ChartData<'bar', number[], string>>({ labels: [], datasets: [] })
    const editorBarChartData = ref<ChartData<'bar', number[], string>>({ labels: [], datasets: [] })

    const chartOptions = brandLineChartOptions()
    const barChartOptions = brandBarChartOptionsWithLegend({
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
        x: { ticks: { maxRotation: 0, autoSkip: true } }
      }
    })

    const selectedTeamObjects = computed(() => availableTeams.value.filter(team => selectedTeams.value.includes(team.slug)))
    const scopeType = computed(() => {
      const config = useRuntimeConfig()
      return config.public.scope === 'enterprise'
        ? t.value('teams.scopeEnterprise')
        : t.value('teams.scopeOrganization')
    })
  // Aggregate total active users across selected teams (latest day for each)
  const aggregatedTotalActiveUsers = ref(0)
  const totalActiveUsers = computed(() => aggregatedTotalActiveUsers.value)

    const clearSelection = () => { selectedTeams.value = [] }
    const getTeamDetailUrl = (teamSlug: string) => {
      const config = useRuntimeConfig()
      return config.public.scope === 'enterprise'
        ? `/enterprises/${config.public.githubEnt}/teams/${teamSlug}`
        : `/orgs/${config.public.githubOrg}/teams/${teamSlug}`
    }


    const teamsInitialLoading = ref(true)
    const teamMetricsLoading = ref(false)

    const loadTeams = async () => {
      const route = useRoute();
      const options = Options.fromRoute(route, props.dateRange.since, props.dateRange.until);
      const params = options.toParams();

      try {
        const teams = await $fetch<Team[]>('/api/teams', { params })
        availableTeams.value = teams
      } finally {
        teamsInitialLoading.value = false
      }
    }
    const loadMetricsForTeams = async (teamSlugs: string[]) => {
      const route = useRoute();
      const options = Options.fromRoute(route, props.dateRange.since, props.dateRange.until);
      if (options.scope === 'team-organization' || options.scope === 'team-enterprise') {
        options.scope = options.githubEnt ? 'enterprise' : 'organization';
      }
      const params = {
        ...options.toParams(),
        teams: teamSlugs.join(',')
      };
      const response = await $fetch<{
        teams: Array<{ slug: string; metrics: Metrics[]; usage: CopilotMetrics[] }>;
      }>('/api/team-metrics', { params });
      return response.teams;
    }

    const generateBarChartData = () => {
      // Generate language bar chart data
      const languages = [...new Set(languageComparison.value.map(l => l.language))]
      const teams = [...new Set(languageComparison.value.map(l => l.team))]

      const languageDatasets = teams.map((team, index) => {
        const colorIndex = index % teamColors.length
        return {
          label: team,
          data: languages.map(language => {
            const langData = languageComparison.value.find(l => l.language === language && l.team === team)
            return langData ? langData.acceptance_rate : 0
          }),
          backgroundColor: teamColors[colorIndex]!.bg,
          borderColor: teamColors[colorIndex]!.border,
          borderWidth: 1,
          borderRadius: 6
        }
      })

      languageBarChartData.value = {
        labels: languages,
        datasets: languageDatasets
      }

      // Generate editor bar chart data
      const editors = [...new Set(editorComparison.value.map(e => e.editor))]

      const editorDatasets = teams.map((team, index) => {
        const colorIndex = index % teamColors.length
        return {
          label: team,
          data: editors.map(editor => {
            const editorData = editorComparison.value.find(e => e.editor === editor && e.team === team)
            return editorData ? editorData.active_users : 0
          }),
          backgroundColor: teamColors[colorIndex]!.bg,
          borderColor: teamColors[colorIndex]!.border,
          borderWidth: 1,
          borderRadius: 6
        }
      })

      editorBarChartData.value = {
        labels: editors,
        datasets: editorDatasets
      }
    }

    // Chart colors for different teams
    const teamColors = [...brandChartPalette]

  const updateChartData = async () => {
      if (selectedTeams.value.length === 0) {
        teamMetricsLoading.value = false
        // Clear all charts
        acceptanceRateCountChartData.value = { labels: [], datasets: [] }
        suggestionsAcceptancesChartData.value = { labels: [], datasets: [] }
        acceptanceRateLinesChartData.value = { labels: [], datasets: [] }
        linesSuggestedAcceptedChartData.value = { labels: [], datasets: [] }
        activeUsersChartData.value = { labels: [], datasets: [] }
        ideCompletionsChartData.value = { labels: [], datasets: [] }
        ideChatChartData.value = { labels: [], datasets: [] }
        githubChatChartData.value = { labels: [], datasets: [] }
        githubPrChartData.value = { labels: [], datasets: [] }
        languageComparison.value = []
        editorComparison.value = []
        languageBarChartData.value = { labels: [], datasets: [] }
        editorBarChartData.value = { labels: [], datasets: [] }
        return
      }

      teamMetricsLoading.value = true
      try {
      const perTeamResponses = await loadMetricsForTeams(selectedTeams.value)

      interface PerTeamData { slug: string; metrics: Metrics[]; usage: CopilotMetrics[] }
      const perTeamData: PerTeamData[] = perTeamResponses.map((resp) => ({
        slug: resp.slug,
        metrics: resp.metrics || [],
        usage: resp.usage || []
      }))

      // Collect unique days across all teams
      const daySet = new Set<string>()
  perTeamData.forEach(t => t.metrics.forEach((m) => { if (m.day) daySet.add(m.day) }))
      // usage array uses 'date' property; ensure inclusion if metrics empty
  perTeamData.forEach(t => t.usage.forEach((u) => { if (u.date) daySet.add(u.date) }))
      const days = Array.from(daySet).sort()

      const getTeamName = (slug: string) => availableTeams.value.find(t => t.slug === slug)?.name || slug

      // Helper to create line datasets pulling from Metrics objects
      const createMetricsDatasets = (metricKey: LineMetricKey, label: string): ChartDataset<'line', number[]>[] => {
        return perTeamData.map((teamData, index) => {
          const teamName = getTeamName(teamData.slug)
          const colorIndex = index % teamColors.length
          return {
            label: t.value(label, { team: teamName }),
            data: days.map(day => {
              const dayData = teamData.metrics.find((d) => d.day === day)
              return dayData ? (dayData[metricKey] || 0) : 0
            }),
            backgroundColor: teamColors[colorIndex]!.bg,
            borderColor: teamColors[colorIndex]!.border,
            tension: 0.1
          }
        })
      }

      acceptanceRateCountChartData.value = {
        labels: days,
        datasets: createMetricsDatasets('acceptance_rate_by_count', 'teams.legendAcceptanceRate')
      }

      // Suggestions & Acceptances datasets
      const suggestionsDatasets: ChartDataset<'line', number[]>[] = []
      perTeamData.forEach((teamData, index) => {
        const teamName = getTeamName(teamData.slug)
        const colorIndex = index % teamColors.length
        const suggestionsDataset: ChartDataset<'line', number[]> = {
          label: t.value('teams.legendSuggestions', { team: teamName }),
          data: days.map(day => {
            const dayData = teamData.metrics.find((d) => d.day === day)
            return dayData ? (dayData.total_suggestions_count || 0) : 0
          }),
          backgroundColor: teamColors[colorIndex]!.bg,
          borderColor: teamColors[colorIndex]!.border,
          tension: 0.1
        }
        const acceptancesDataset: ChartDataset<'line', number[]> = {
          label: t.value('teams.legendAcceptances', { team: teamName }),
          data: days.map(day => {
            const dayData = teamData.metrics.find((d) => d.day === day)
            return dayData ? (dayData.total_acceptances_count || 0) : 0
          }),
          backgroundColor: teamColors[colorIndex]!.bg,
          borderColor: teamColors[colorIndex]!.border,
          borderDash: [5, 5],
          tension: 0.1
        }
        suggestionsDatasets.push(suggestionsDataset, acceptancesDataset)
      })
      suggestionsAcceptancesChartData.value = { labels: days, datasets: suggestionsDatasets }

      acceptanceRateLinesChartData.value = {
        labels: days,
        datasets: createMetricsDatasets('acceptance_rate_by_lines', 'teams.legendAcceptanceRate')
      }

      // Lines suggested & accepted
      const linesDatasets: ChartDataset<'line', number[]>[] = []
      perTeamData.forEach((teamData, index) => {
        const teamName = getTeamName(teamData.slug)
        const colorIndex = index % teamColors.length
        linesDatasets.push(
          {
            label: t.value('teams.legendLinesSuggested', { team: teamName }),
            data: days.map(day => {
              const dayData = teamData.metrics.find((d) => d.day === day)
              return dayData ? (dayData.total_lines_suggested || 0) : 0
            }),
            backgroundColor: teamColors[colorIndex]!.bg,
            borderColor: teamColors[colorIndex]!.border,
            tension: 0.1
          },
          {
            label: t.value('teams.legendLinesAccepted', { team: teamName }),
            data: days.map(day => {
              const dayData = teamData.metrics.find((d) => d.day === day)
              return dayData ? (dayData.total_lines_accepted || 0) : 0
            }),
            backgroundColor: teamColors[colorIndex]!.bg,
            borderColor: teamColors[colorIndex]!.border,
            borderDash: [5, 5],
            tension: 0.1
          }
        )
      })
      linesSuggestedAcceptedChartData.value = { labels: days, datasets: linesDatasets }

      activeUsersChartData.value = {
        labels: days,
        datasets: createMetricsDatasets('total_active_users', 'teams.legendActiveUsers')
      }

      // Feature usage charts derived from NEW usage format (CopilotMetrics)
      const createUsageDataset = (path: string[], label: string): ChartDataset<'line', number[]>[] => {
        return perTeamData.map((teamData, index) => {
          const teamName = getTeamName(teamData.slug)
            const colorIndex = index % teamColors.length
            return {
              label: t.value(label, { team: teamName }),
              data: days.map(day => {
                const usageDay = teamData.usage.find((u) => u.date === day)
                if (!usageDay) return 0
                // Traverse path for nested value
                let val: unknown = usageDay
                for (const segment of path) {
                  // Dynamic traversal through nested objects using optional chaining
                  val = val?.[segment]
                  if (val == null) break
                }
                return (typeof val === 'number') ? val : 0
              }),
              backgroundColor: teamColors[colorIndex]!.bg,
              borderColor: teamColors[colorIndex]!.border,
              tension: 0.1
            }
        })
      }

      ideCompletionsChartData.value = { labels: days, datasets: createUsageDataset(['copilot_ide_code_completions', 'total_engaged_users'], 'teams.legendIdeCompletions') }
      ideChatChartData.value = { labels: days, datasets: createUsageDataset(['copilot_ide_chat', 'total_engaged_users'], 'teams.legendIdeChat') }
      githubChatChartData.value = { labels: days, datasets: createUsageDataset(['usage_detail', 'daily_active_cli_users'], 'teams.legendCli') }
      githubPrChartData.value = { labels: days, datasets: createUsageDataset(['usage_detail', 'daily_active_copilot_code_review_users'], 'teams.legendCodeReview') }

      // Derive language & editor comparisons from breakdown across all days per team
      const langComp: LanguageTeamData[] = []
      const editorComp: EditorTeamData[] = []
      perTeamData.forEach(teamData => {
        const langAgg: Record<string, { suggestions: number; acceptances: number }> = {}
        const editorAgg: Record<string, number> = {}
        teamData.metrics.forEach((m) => {
          (m.breakdown || []).forEach((b) => {
            if (b.language) {
              if (!langAgg[b.language]) langAgg[b.language] = { suggestions: 0, acceptances: 0 }
              langAgg[b.language].suggestions += b.suggestions_count || 0
              langAgg[b.language].acceptances += b.acceptances_count || 0
            }
            if (b.editor) {
              editorAgg[b.editor] = (editorAgg[b.editor] || 0) + (b.active_users || 0)
            }
          })
        })
        Object.entries(langAgg).forEach(([language, vals]) => {
          const rate = vals.suggestions ? (vals.acceptances / vals.suggestions) * 100 : 0
          langComp.push({ team: teamData.slug, language, acceptance_rate: rate })
        })
        Object.entries(editorAgg).forEach(([editor, active]) => {
          editorComp.push({ team: teamData.slug, editor, active_users: active })
        })
      })
      languageComparison.value = langComp
      editorComparison.value = editorComp
      generateBarChartData()

      // Update total active users (latest day per team)
      let totalActive = 0
      perTeamData.forEach(teamData => {
        if (teamData.metrics.length) {
          const latest = [...teamData.metrics].sort((a, b) => a.day.localeCompare(b.day)).at(-1)
          totalActive += latest?.total_active_users || 0
        }
      })
      aggregatedTotalActiveUsers.value = totalActive
      } finally {
        teamMetricsLoading.value = false
      }
    }

    // Load teams on mount, then react to selection changes
    onMounted(async () => { await loadTeams() })
    watch(selectedTeams, async () => { await updateChartData() })
    watch(() => props.dateRange, async () => {
      // When date range changes, reload charts with new params
      await updateChartData()
    }, { deep: true })

    return {
      chartTooltips,
      t,
      // derived props to avoid duplicate key in template scope
      dateRangeDesc: props.dateRangeDescription,
      teamsInitialLoading,
      teamMetricsLoading,
      // state
      availableTeams,
      selectedTeams,
      acceptanceRateCountChartData,
      suggestionsAcceptancesChartData,
      acceptanceRateLinesChartData,
      linesSuggestedAcceptedChartData,
      activeUsersChartData,
      ideCompletionsChartData,
      ideChatChartData,
      githubChatChartData,
      githubPrChartData,
      languageComparison,
      editorComparison,
      languageBarChartData,
      editorBarChartData,
      chartOptions,
      barChartOptions,
      selectedTeamObjects,
      scopeType,
  totalActiveUsers,
      clearSelection,
      getTeamDetailUrl,
      generateBarChartData,
  loadTeams
    }
  }
})
</script>

<style scoped>
:deep(.teams-select-menu) {
  max-height: 360px;
  overflow-y: auto;
  background-color: var(--v-theme-surface, #fff) !important;
  box-shadow: 0 6px 24px rgba(59, 75, 191, 0.15);
  border: 1px solid var(--app-accent-weak);
  z-index: 2000;
  border-radius: 8px;
  min-width: unset;
}

:deep(.teams-select-menu .v-list) {
  padding: 8px 0;
}

:deep(.teams-select-menu .v-list-item) {
  min-height: 40px;
}

:deep(.teams-select-menu .v-checkbox .v-selection-control) {
  align-items: center;
}

.tiles-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  margin: 16px 0;
}

.tiles-text {
  text-align: center;
  padding: 8px;
}

.spacing-25 {
  height: 25px;
}

.spacing-10 {
  height: 10px;
}

.bar-chart-container {
  position: relative;
  height: 320px; /* Increased height for better visibility */
  /* Allow responsive shrink on very narrow screens */
  max-height: 60vh;
}
</style>