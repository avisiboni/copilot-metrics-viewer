<template>
  <div>
    <div class="tiles-container">      
      <!-- Acceptance Rate Tile -->  
      <!--changed on 2024/11/22 to reorder cards, so the accepance rate by counts are be more focused-->
      <v-card variant="flat" class="brand-kpi-card">
        <BrandKpiTooltip :text="t('metrics.kpiTooltipAcceptanceCount')" />
        <v-card-item>
          <div class="tiles-text">
            <div class="spacing-25"/>
            <div class="text-h6 mb-1">{{ t('metrics.acceptanceRateByCount') }}</div>
            <div class="text-caption">
              {{ dateRangeDescription }}
            </div>
            <p class="text-h4">{{ acceptanceRateAverageByCount.toFixed(2) }}%</p>
          </div>
        </v-card-item>
      </v-card>

      <v-card variant="flat" class="brand-kpi-card">
        <BrandKpiTooltip :text="t('metrics.kpiTooltipTotalSuggestions')" />
        <v-card-item>
          <div class="tiles-text">
            <div class="spacing-10"/>
            <div class="text-h6 mb-1">{{ t('metrics.totalSuggestions') }}</div>
              <div class="text-caption">
              {{ dateRangeDescription }}
            </div>
            <p class="text-h4">{{ cumulativeNumberSuggestions }}</p>
          </div>
        </v-card-item>
      </v-card>

      <v-card variant="flat" class="brand-kpi-card">
          <BrandKpiTooltip :text="t('metrics.kpiTooltipAcceptanceLines')" />
          <v-card-item>
            <div class="spacing-25"/>
            <div class="tiles-text">
              <div class="text-h6 mb-1">{{ t('metrics.acceptanceRateByLines') }}</div>
              <div class="text-caption">
                {{ dateRangeDescription }}
              </div>
              <p class="text-h4">{{ acceptanceRateAverageByLines.toFixed(2) }}%</p>
          </div>
        </v-card-item>
      </v-card>

      <v-card variant="flat" class="brand-kpi-card">
        <BrandKpiTooltip :text="t('metrics.kpiTooltipTotalLines')" />
        <v-card-item>
          <div class="tiles-text">
            <div class="spacing-10"/>
            <div class="text-h6 mb-1">{{ t('metrics.totalLinesSuggested') }}</div>
            <div class="text-caption">
              {{ dateRangeDescription }}
            </div>
            <p class="text-h4">{{ totalLinesSuggested }}</p>
          </div>
        </v-card-item>
      </v-card>
    </div>

    <BrandAiAdoptionPanel
      v-if="showAiAdoptionCohorts && adoptionByPhase.length"
      :phases="adoptionByPhase"
      class="mb-4"
    />

    <section class="brand-page-panel">
      <BrandChartTitle
        :title="t('metrics.chartAcceptanceRateByCount')"
        :tooltip="chartTooltips.acceptanceRateByCount"
        heading-class=""
      />
      <Line :data="acceptanceRateByCountChartData" :options="chartOptions" />

      <BrandChartTitle
        :title="t('metrics.chartSuggestionsAcceptances')"
        :tooltip="chartTooltips.totalSuggestionsAndAcceptances"
      />
      <Line :data="totalSuggestionsAndAcceptanceChartData" :options="chartOptions" />

      <BrandChartTitle
        :title="t('metrics.chartAcceptanceRateByLines')"
        :tooltip="chartTooltips.acceptanceRateByLines"
        heading-class=""
      />
      <Line :data="acceptanceRateByLinesChartData" :options="chartOptions" />

      <BrandChartTitle
        :title="t('metrics.chartLinesSuggestedAccepted')"
        :tooltip="chartTooltips.totalLinesSuggestedAccepted"
      />
      <Line :data="chartData" :options="chartOptions" />

      <BrandChartTitle
        :title="t('metrics.chartTotalActiveUsers')"
        :tooltip="chartTooltips.totalActiveUsers"
      />
      <Bar :data="totalActiveUsersChartData" :options="totalActiveUsersChartOptions" />

      <BrandChartTitle
        :title="t('metrics.chartDauWauMau')"
        :tooltip="chartTooltips.dauWauMau"
      />
      <Line :data="engagementChartData" :options="chartOptions" />

    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRef, watchEffect } from 'vue';
import { useChartTooltips } from '@/utils/chart-tooltips';
import type { Metrics } from '@/model/Metrics';
import type { CopilotMetrics } from '@/model/Copilot_Metrics';
import type { AiAdoptionPhaseAggregate } from '../../shared/types/copilot-usage';
import BrandAiAdoptionPanel from '@/components/BrandAiAdoptionPanel.vue';
import type { PropType } from 'vue';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

import { Line, Bar } from 'vue-chartjs'
import {
  barDataset,
  brandBarChartOptions,
  brandLineChartOptions,
  lineDataset
} from '@/utils/chart-theme'

ChartJS.register(
  ArcElement, 
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)


export default defineComponent({
  name: 'MetricsViewer',
  components: {
    Line,
    Bar,
    BrandAiAdoptionPanel
  },
  props: {
        metrics: {
            type: Array as PropType<Metrics[]>,
            required: true
        },
        dateRangeDescription: {
            type: String,
            default: 'Over the last 28 days'
        },
        usage: {
            type: Array as PropType<CopilotMetrics[]>,
            default: () => []
        },
        adoptionByPhase: {
            type: Array as PropType<AiAdoptionPhaseAggregate[]>,
            default: () => []
        }
    },
  setup(props) {
    const chartTooltips = useChartTooltips()
    const { t } = useAppI18n()
    const { visible: showAiAdoptionCohorts } = useAiAdoptionCohortsFeature()

    //Tiles
    const acceptanceRateAverageByLines = ref(0);
    const acceptanceRateAverageByCount = ref(0);
    const cumulativeNumberSuggestions = ref(0);
    const cumulativeNumberAcceptances = ref(0);
    const cumulativeNumberLOCAccepted = ref(0);
    const totalLinesSuggested = ref(0);

    //Acceptance Rate by lines
    const acceptanceRateByLinesChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    //Acceptance Rate by count
    const acceptanceRateByCountChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    //Total Suggestions Count | Total Acceptance Counts
    const totalSuggestionsAndAcceptanceChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    //Total Lines Suggested | Total Lines Accepted
    const chartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
    
    //Total Active Users
    const totalActiveUsersChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
    const engagementChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    const chartOptions = brandLineChartOptions()

    const totalActiveUsersChartOptions = brandBarChartOptions({
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    })

    // Watch for changes in metrics prop and recalculate all data
    watchEffect(() => {
      const data = toRef(props, 'metrics').value;
      const translate = t.value
      
      if (!data || data.length === 0) {
        return;
      }

      cumulativeNumberSuggestions.value = 0;
    const cumulativeSuggestionsData = data.map((m: Metrics) => {
      cumulativeNumberSuggestions.value += m.total_suggestions_count;
      return m.total_suggestions_count;
    });

    cumulativeNumberAcceptances.value = 0;
    const cumulativeAcceptancesData = data.map((m: Metrics) => {
      cumulativeNumberAcceptances.value += m.total_acceptances_count;
      return m.total_acceptances_count;
    });

    totalSuggestionsAndAcceptanceChartData.value = {
      labels: data.map((m: Metrics) => m.day),
      datasets: [
        lineDataset(translate('metrics.legendTotalSuggestions'), cumulativeSuggestionsData, 0),
        lineDataset(translate('metrics.legendTotalAcceptance'), cumulativeAcceptancesData, 1)
      ]
    };

    cumulativeNumberLOCAccepted.value = 0;
    const cumulativeLOCAcceptedData = data.map((m: Metrics) => {
      const total_lines_accepted = m.total_lines_accepted;
      cumulativeNumberLOCAccepted.value += total_lines_accepted;
      return total_lines_accepted;
    });

    chartData.value = {
      labels: data.map((m: Metrics) => m.day),
      datasets: [
        lineDataset(translate('metrics.legendTotalLinesSuggested'), data.map((m: Metrics) => m.total_lines_suggested), 0),
        lineDataset(translate('metrics.legendTotalLinesAccepted'), cumulativeLOCAcceptedData, 1)
      ]
    };
    
    const acceptanceRatesByLines = data.map((m: Metrics) => {
      const rate = m.total_lines_suggested !== 0 ? (m.total_lines_accepted / m.total_lines_suggested) * 100 : 0;
      return rate;
    });

    const acceptanceRatesByCount = data.map((m: Metrics) => {
      const rate = m.total_suggestions_count !== 0 ? (m.total_acceptances_count / m.total_suggestions_count) * 100 : 0;
      return rate;
    });

    acceptanceRateByLinesChartData.value = {
      labels: data.map((m: Metrics) => m.day),
      datasets: [lineDataset(translate('metrics.legendAcceptanceRateLines'), acceptanceRatesByLines, 0)]
    };

    acceptanceRateByCountChartData.value = {
      labels: data.map((m: Metrics) => m.day),
      datasets: [lineDataset(translate('metrics.legendAcceptanceRateCount'), acceptanceRatesByCount, 1)]
    };
    
    totalLinesSuggested.value = data.reduce((sum: number, m: Metrics) => sum + m.total_lines_suggested, 0);

    if(totalLinesSuggested.value === 0){
      acceptanceRateAverageByLines.value = 0;
    } else {
      acceptanceRateAverageByLines.value = cumulativeNumberLOCAccepted.value / totalLinesSuggested.value * 100;
    }

    // Calculate acceptanceRateAverageByCount
    if (cumulativeNumberSuggestions.value === 0) {
      acceptanceRateAverageByCount.value = 0;
    } else {
      acceptanceRateAverageByCount.value = cumulativeNumberAcceptances.value / cumulativeNumberSuggestions.value * 100;
    }

    totalActiveUsersChartData.value = {
      labels: data.map((m: Metrics) => m.day),
      datasets: [
        barDataset(
          translate('metrics.legendTotalActiveUsers'),
          data.map((m: Metrics) => m.total_active_users),
          1
        )
      ]
    };

    const usageData = toRef(props, 'usage').value || [];
    engagementChartData.value = {
      labels: usageData.map((m) => m.date),
      datasets: [
        lineDataset(
          translate('metrics.legendDau'),
          usageData.map((m) => m.usage_detail?.daily_active_users ?? m.total_active_users),
          0
        ),
        lineDataset(
          translate('metrics.legendWau'),
          usageData.map((m) => m.usage_detail?.weekly_active_users || 0),
          2
        ),
        lineDataset(
          translate('metrics.legendMau'),
          usageData.map((m) => m.usage_detail?.monthly_active_users || 0),
          3
        )
      ]
    };
    
    }); // end of watchEffect

    return {
      t,
      showAiAdoptionCohorts,
      chartTooltips,
      totalSuggestionsAndAcceptanceChartData,
      chartData,
      chartOptions,
      totalActiveUsersChartData,
      engagementChartData,
      totalActiveUsersChartOptions,
      acceptanceRateByLinesChartData,
      acceptanceRateByCountChartData,
      acceptanceRateAverageByLines,
      acceptanceRateAverageByCount,
      cumulativeNumberSuggestions,
      cumulativeNumberAcceptances,
      cumulativeNumberLOCAccepted,
      totalLinesSuggested
    };
  },
  data () {
    return {
      data : {
        labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
        datasets: [
          {
        backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
        data: [40, 20, 80, 10]
        }
        ]
      },
      options : {
        responsive: true,
      maintainAspectRatio: false
      }
    }
  },
  
});
</script>
