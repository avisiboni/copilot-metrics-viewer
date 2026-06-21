<template>
    <div class="github-com-container">
        <section class="brand-page-panel">
                <BrandPageSkeleton
                    v-if="loading"
                    layout="agent-mode"
                    :aria-label="t('usageInsights.loading')"
                />

                <!-- Error state -->
                <div v-else-if="error" class="d-flex justify-center align-center" style="min-height: 300px;">
                    <BrandDismissibleAlert
                        type="error"
                        alert-class="brand-alert brand-alert--error mb-4"
                        :close-label="t('common.close')"
                        :title="t('usageInsights.errorTitle')"
                    >
                        {{ error }}
                    </BrandDismissibleAlert>
                </div>

                <!-- Main content -->
                <div v-else>
                    <!-- Agent Mode Statistics Title -->
                    <BrandChartTitle
                        :title="t('usageInsights.title')"
                        :tooltip="chartTooltips.usageInsightsOverview"
                        heading-class="mb-4"
                    />

                    <BrandAiAdoptionPanel
                        v-if="showAiAdoptionCohorts && adoptionByPhase.length"
                        :phases="adoptionByPhase"
                    />

                    <!-- Agent Mode Overview Cards -->
                    <v-row class="mb-4">
                        <v-col cols="12" md="6" lg="3">
                            <v-card variant="flat" class="brand-kpi-card brand-metric-card--purple">
                                <BrandKpiTooltip :text="t('usageInsights.kpiTooltipCompletions')" />
                                <v-card-title class="text-h6">{{ t('usageInsights.ideCompletions') }}</v-card-title>
                                <v-card-text>
                                    <div class="text-h4 mb-2">{{ stats.totalIdeCodeCompletionUsers }}</div>
                                    <div class="text-caption">{{ t('usageInsights.totalUsersActivity') }}</div>
                                    <div class="text-subtitle2 mt-2">
                                      {{ t('usageInsights.modelsUsed', { count: stats.totalIdeCodeCompletionModels }) }}
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6" lg="3">
                            <v-card variant="flat" class="brand-kpi-card brand-metric-card--turquoise">
                                <BrandKpiTooltip :text="t('usageInsights.kpiTooltipChat')" />
                                <v-card-title class="text-h6">{{ t('usageInsights.ideChat') }}</v-card-title>
                                <v-card-text>
                                    <div class="text-h4 mb-2">{{ stats.totalIdeChatUsers }}</div>
                                    <div class="text-caption">{{ t('usageInsights.totalUsersActivity') }}</div>
                                    <div class="text-subtitle2 mt-2">
                                      {{ t('usageInsights.modelsUsed', { count: stats.totalIdeChatModels }) }}
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6" lg="3">
                            <v-card variant="flat" class="brand-kpi-card brand-metric-card--lavender">
                                <BrandKpiTooltip :text="t('usageInsights.kpiTooltipCli')" />
                                <v-card-title class="text-h6">{{ t('usageInsights.copilotCli') }}</v-card-title>
                                <v-card-text>
                                    <div class="text-h4 mb-2">{{ stats.totalCliUsers }}</div>
                                    <div class="text-caption">{{ t('usageInsights.cliActiveUsers') }}</div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6" lg="3">
                            <v-card variant="flat" class="brand-kpi-card brand-metric-card--accent">
                                <BrandKpiTooltip :text="t('usageInsights.kpiTooltipReview')" />
                                <v-card-title class="text-h6">{{ t('usageInsights.codeReview') }}</v-card-title>
                                <v-card-text>
                                    <div class="text-h4 mb-2">{{ stats.totalCodeReviewActiveUsers }}</div>
                                    <div class="text-caption">{{ t('usageInsights.activeReviewUsers') }}</div>
                                    <div class="text-subtitle2 mt-2">{{ t('usageInsights.passive', { count: stats.totalCodeReviewPassiveUsers }) }}</div>
                                    <div class="text-subtitle2">{{ t('usageInsights.agentLocAdded', { count: stats.totalAgentLocAdded }) }}</div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- Agent Mode Statistics Chart -->
                    <BrandChartTitle
                        :title="t('usageInsights.chartFeatureUsage')"
                        :tooltip="chartTooltips.copilotFeatureUsageOverTime"
                    />
                    <div class="chart-container">
                        <LineChart
v-if="stats.featureUsageChartData.labels.length" :data="stats.featureUsageChartData"
                            :options="chartOptions" />
                    </div>

                    <BrandChartTitle
                        :title="t('usageInsights.chartDauWauMau')"
                        :tooltip="chartTooltips.usageInsightsDauWauMau"
                        wrapper-class="mt-6"
                    />
                    <div class="chart-container">
                        <LineChart
v-if="stats.activeUsersChartData.labels.length" :data="stats.activeUsersChartData"
                            :options="chartOptions" />
                    </div>

                    <BrandChartTitle
                        :title="t('usageInsights.chartChatByMode')"
                        :tooltip="chartTooltips.usageInsightsChatByMode"
                        wrapper-class="mt-6"
                    />
                    <div class="chart-container">
                        <LineChart
v-if="stats.chatModeChartData.labels.length" :data="stats.chatModeChartData"
                            :options="chartOptions" />
                    </div>

                    <BrandChartTitle
                        :title="t('usageInsights.chartCli')"
                        :tooltip="chartTooltips.usageInsightsCli"
                        wrapper-class="mt-6"
                    />
                    <div class="chart-container">
                        <LineChart
v-if="stats.cliChartData.labels.length" :data="stats.cliChartData"
                            :options="chartOptions" />
                    </div>

                    <!-- Models Used Section -->
                    <BrandChartTitle
                        :title="t('usageInsights.chartModels')"
                        :tooltip="chartTooltips.modelsUsedByUsers"
                        wrapper-class="mt-6"
                        heading-class="mb-4"
                    />

                    <!-- Models by Agent Mode -->
                    <v-expansion-panels class="mb-4">
                        <v-expansion-panel v-if="stats.ideCodeCompletionModels.length > 0">
                            <v-expansion-panel-title>
                                <v-icon start>mdi-code-braces</v-icon>
                                {{ t('usageInsights.panelCompletions', { count: stats.ideCodeCompletionModels.length }) }}
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <v-data-table
:headers="codeCompletionHeaders" :items="stats.ideCodeCompletionModels"
                                    class="brand-data-table" item-key="name" density="comfortable" />
                            </v-expansion-panel-text>
                        </v-expansion-panel>

                        <v-expansion-panel v-if="stats.ideChatModels.length > 0">
                            <v-expansion-panel-title>
                                <v-icon start>mdi-chat</v-icon>
                                {{ t('usageInsights.panelChat', { count: stats.ideChatModels.length }) }}
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <v-data-table
:headers="ideChatHeaders" :items="stats.ideChatModels" class="brand-data-table"
                                    item-key="name" density="comfortable" />
                            </v-expansion-panel-text>
                        </v-expansion-panel>

                    </v-expansion-panels>
                </div>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, type PropType, shallowRef } from 'vue';
import BrandPageSkeleton from '@/components/BrandPageSkeleton.vue';
import BrandDismissibleAlert from '@/components/BrandDismissibleAlert.vue';
import { useChartTooltips } from '@/utils/chart-tooltips';
import type { CopilotMetrics } from '@/model/Copilot_Metrics';
import { Options } from '@/model/Options';
import { useRoute } from 'vue-router';
import { Line as LineChart } from 'vue-chartjs';
import { brandLineChartOptions } from '@/utils/chart-theme';
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
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ModelData {
    name: string;
    editor?: string;
    repository?: string;
    model_type: string;
    total_engaged_users: number;
    total_chats?: number;
    total_chat_insertion_events?: number;
    total_chat_copy_events?: number;
    total_pr_summaries_created?: number;
}

interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        borderColor?: string;
        backgroundColor?: string;
        fill?: boolean;
    }>;
}

interface GitHubStats {
    totalIdeCodeCompletionUsers: number;
    totalIdeChatUsers: number;
    totalCliUsers: number;
    totalCodeReviewActiveUsers: number;
    totalCodeReviewPassiveUsers: number;
    totalAgentLocAdded: number;
    totalAgentLocDeleted: number;
    totalIdeCodeCompletionModels: number;
    totalIdeChatModels: number;
    ideCodeCompletionModels: ModelData[];
    ideChatModels: ModelData[];
    featureUsageChartData: ChartData;
    activeUsersChartData: ChartData;
    chatModeChartData: ChartData;
    cliChartData: ChartData;
}

const defaultStats: GitHubStats = {
    totalIdeCodeCompletionUsers: 0,
    totalIdeChatUsers: 0,
    totalCliUsers: 0,
    totalCodeReviewActiveUsers: 0,
    totalCodeReviewPassiveUsers: 0,
    totalAgentLocAdded: 0,
    totalAgentLocDeleted: 0,
    totalIdeCodeCompletionModels: 0,
    totalIdeChatModels: 0,
    ideCodeCompletionModels: [],
    ideChatModels: [],
    featureUsageChartData: { labels: [], datasets: [] },
    activeUsersChartData: { labels: [], datasets: [] },
    chatModeChartData: { labels: [], datasets: [] },
    cliChartData: { labels: [], datasets: [] }
};

interface DateRange {
    since?: string;
    until?: string;
}

export default defineComponent({
    name: 'AgentModeViewer',
    components: {
        LineChart,
        BrandPageSkeleton,
        BrandDismissibleAlert
    },
    props: {
        dateRange: {
            type: Object as PropType<DateRange>,
            required: true
        },
        originalMetrics: {
            type: Array as PropType<CopilotMetrics[]>,
            required: true
        },
        dateRangeDescription: {
            type: String,
            default: ''
        },
        adoptionByPhase: {
            type: Array as PropType<import('../../shared/types/copilot-usage').AiAdoptionPhaseAggregate[]>,
            default: () => []
        }
    },
    setup(props) {
        const chartTooltips = useChartTooltips()
        const { t } = useAppI18n()
        const { visible: showAiAdoptionCohorts } = useAiAdoptionCohortsFeature()
        // Use shallowRef for better performance with large objects
        const stats = shallowRef<GitHubStats>({ ...defaultStats });
        const loading = ref(false);
        const error = ref<string | null>(null);
        const route = useRoute();

        // Cache to prevent unnecessary API calls
        const lastMetricsHash = ref<string>('');
        const lastDateRange = ref<string>('');

        // Optimized fetch function with caching and debouncing
        let fetchTimeout: ReturnType<typeof setTimeout> | null = null;
        const fetchStats = async () => {
            if (props.originalMetrics.length === 0) return;

            // Create a simple hash of the metrics to detect changes
            const currentHash = JSON.stringify(props.originalMetrics.map(m => ({
                date: m.date,
                activeUsers: m.total_active_users,
                engagedUsers: m.total_engaged_users
            })));
            const currentDateRange = props.dateRangeDescription || '';

            if (currentHash === lastMetricsHash.value && currentDateRange === lastDateRange.value) return;

            if (fetchTimeout) {
                clearTimeout(fetchTimeout);
            }

            fetchTimeout = setTimeout(async () => {
                loading.value = true;
                error.value = null;

                try {
                    // Extract date range from props.originalMetrics if available
                    const options = Options.fromRoute(route, props.dateRange.since, props.dateRange.until);
                    const params = options.toParams();
                    const queryString = new URLSearchParams(params).toString();
                    const apiUrl = queryString ? `/api/github-stats?${queryString}` : '/api/github-stats';

                    const response = await $fetch(apiUrl) as GitHubStats;
                    // Use Object.assign to maintain reactivity while updating properties
                    Object.assign(stats.value, response);
                    lastMetricsHash.value = currentHash;
                    lastDateRange.value = currentDateRange;
                } catch (err: unknown) {
                    error.value = err instanceof Error ? err.message : t.value('usageInsights.errorLoad');
                    console.error('Error fetching GitHub stats:', err);
                } finally {
                    loading.value = false;
                }
            }, 150); // Reduced debounce time for better responsiveness
        };

        // Watch for changes with improved performance
        watch(() => [props.originalMetrics, props.dateRangeDescription, props.dateRange], fetchStats, { immediate: true, deep: false });

        // Static table headers (avoid recreating on every render)
        const codeCompletionHeaders = [
            { title: t.value('usageInsights.colModel'), key: 'name' },
            { title: t.value('usageInsights.colEditor'), key: 'editor' },
            { title: t.value('usageInsights.colType'), key: 'model_type' },
            { title: t.value('usageInsights.colTotalUsers'), key: 'total_engaged_users' }
        ];

        const ideChatHeaders = [
            { title: t.value('usageInsights.colModel'), key: 'name' },
            { title: t.value('usageInsights.colEditor'), key: 'editor' },
            { title: t.value('usageInsights.colType'), key: 'model_type' },
            { title: t.value('usageInsights.colTotalUsers'), key: 'total_engaged_users' },
            { title: t.value('usageInsights.colTotalChats'), key: 'total_chats' },
            { title: t.value('usageInsights.colInsertions'), key: 'total_chat_insertion_events' },
            { title: t.value('usageInsights.colCopyEvents'), key: 'total_chat_copy_events' }
        ];

        const chartOptions = brandLineChartOptions({
            animation: { duration: 0 },
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: t.value('usageInsights.yAxisUsers'),
                        color: '#343546',
                        font: { family: "'Assistant', Arial, sans-serif", size: 12 }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: t.value('usageInsights.chartFeatureUsage'),
                    color: '#343546',
                    font: { family: "'Assistant', Arial, sans-serif", size: 14, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        });

        return {
            t,
            showAiAdoptionCohorts,
            chartTooltips,
            stats,
            loading,
            error,
            codeCompletionHeaders,
            ideChatHeaders,
            chartOptions
        };
    }
});
</script>

<style scoped>
.github-com-container {
    padding: 16px;
}

.v-card {
    margin-bottom: 16px;
}

.v-expansion-panel {
    margin-bottom: 8px;
}

.v-data-table {
    margin-top: 16px;
}

/* Optimize chart rendering */
.chart-container {
    height: 400px;
    width: 100%;
    position: relative;
}
</style>