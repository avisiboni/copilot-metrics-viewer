<template>
  <div>
    <div class="tiles-container">
      <v-card variant="flat" class="brand-kpi-card">
          <BrandKpiTooltip :text="t('breakdown.kpiTooltip', { entity: entityPluralLower })" />
          <v-card-item>
            <div class="tiles-text">
              <div class="spacing-25"/>
              <div class="text-h6 mb-1">{{ t('breakdown.kpiCount', { entity: entityPluralLabel }) }}</div>
              <div class="text-caption">
                {{ dateRangeDescription }}
              </div>
              <p class="text-h4">{{ numberOfBreakdowns }}</p> 
          </div>
        </v-card-item>
      </v-card>
    </div>

    <section class="brand-page-panel">
        <v-row>
          <v-col cols="4">
            <v-card>
              <v-card-item class="d-flex justify-center align-center">
                <div class="spacing-25"/>
                <BrandChartTitle
                  :title="t('breakdown.chartTopAccepted', { entities: entityPluralLabel })"
                  :tooltip="chartTooltips.breakdownTopAcceptedPrompts"
                  heading-tag="div"
                  heading-class="text-h6 mb-1"
                />
                <div style="width: 300px; height: 300px;">
                  <Pie :data="breakdownsChartDataTop5AcceptedPrompts" :options="chartOptions" />
                </div>
              </v-card-item>
            </v-card>
          </v-col>

          <v-col cols="4">
            <v-card>
              <v-card-item class="d-flex justify-center align-center">
                <div class="spacing-25"/>
                <BrandChartTitle
                  :title="t('breakdown.chartAcceptanceByCount', { entities: entityPluralLabel })"
                  :tooltip="chartTooltips.breakdownAcceptanceRateByCount"
                  heading-tag="div"
                  heading-class="text-h6 mb-1"
                />
                <div style="width: 300px; height: 300px;">
                  <Pie :data="breakdownsChartDataTop5AcceptedPromptsByCounts" :options="chartOptions" />
                </div>
              </v-card-item>
            </v-card>
          </v-col>

          <v-col cols="4">
            <v-card>
              <v-card-item class="d-flex justify-center align-center">
                <div class="spacing-25"/>
                <BrandChartTitle
                  :title="t('breakdown.chartAcceptanceByLines', { entities: entityPluralLabel })"
                  :tooltip="chartTooltips.breakdownAcceptanceRateByLines"
                  heading-tag="div"
                  heading-class="text-h6 mb-1"
                />
                <div style="width: 300px; height: 300px;">
                  <Pie :data="breakdownsChartDataTop5AcceptedPromptsByLines" :options="chartOptions" />
                </div>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>

        <BrandTableShell
          class="mt-2"
          :title="t('breakdown.tableTitle', { entities: entityPluralLabel })"
        >
        <v-data-table
          :headers="headers"
          :items="breakdownList"
          density="comfortable"
          class="brand-data-table"
        >
            <template #item="{item}">
                <tr>
                    <td>{{ item.name }}</td>
                    <td>{{ item.acceptedPrompts }}</td>
                    <td>{{ item.suggestedPrompts }}</td>
                    <td>{{ item.acceptedLinesOfCode }}</td>
                    <td>{{ item.suggestedLinesOfCode }}</td>
                    <td v-if="item.acceptanceRateByCount !== undefined">{{ item.acceptanceRateByCount.toFixed(2) }}%</td>
                    <td v-if="item.acceptanceRateByLines !== undefined">{{ item.acceptanceRateByLines.toFixed(2) }}%</td>
                </tr>
            </template>
        </v-data-table>
        </BrandTableShell>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import BrandTableShell from '@/components/BrandTableShell.vue';
import type { Metrics } from '@/model/Metrics';
import { Breakdown } from '@/model/Breakdown';
import { Pie } from 'vue-chartjs'
import { brandPieChartColors } from '@/utils/brand-colors'
import { brandPieChartOptions } from '@/utils/chart-theme'
import { useChartTooltips } from '@/utils/chart-tooltips'

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
  name: 'BreakdownComponent',
  components: {
    BrandTableShell,
    Pie
  },
  props: {
      metrics: {
          type: Object,
          required: true
      },
      breakdownKey: {
          type: String,
          required: true
      },
      dateRangeDescription: {
          type: String,
          default: ''
      }
  },
  setup(props) {
    const { t } = useAppI18n()
    const chartTooltips = useChartTooltips()

    const entityPluralKey = computed(() =>
      props.breakdownKey === 'language' ? 'breakdown.entityLanguages' : 'breakdown.entityEditors'
    )
    const entitySingularKey = computed(() =>
      props.breakdownKey === 'language' ? 'breakdown.entityLanguage' : 'breakdown.entityEditor'
    )
    const entityPluralLabel = computed(() => t.value(entityPluralKey.value))
    const entityPluralLower = computed(() => entityPluralLabel.value.toLowerCase())

    const headers = computed(() => [
      { title: t.value('breakdown.headerName', { entity: t.value(entitySingularKey.value) }), key: 'name' },
      { title: t.value('breakdown.headerAcceptedPrompts'), key: 'acceptedPrompts' },
      { title: t.value('breakdown.headerSuggestedPrompts'), key: 'suggestedPrompts' },
      { title: t.value('breakdown.headerAcceptedLines'), key: 'acceptedLinesOfCode' },
      { title: t.value('breakdown.headerSuggestedLines'), key: 'suggestedLinesOfCode' },
      { title: t.value('breakdown.headerAcceptanceCount'), key: 'acceptanceRateByCount' },
      { title: t.value('breakdown.headerAcceptanceLines'), key: 'acceptanceRateByLines' },
    ])

    const breakdownList = ref<Breakdown[]>([]);
    const numberOfBreakdowns = ref(0);
    const breakdownsChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
    const breakdownsChartDataTop5AcceptedPrompts = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
    const breakdownsChartDataTop5AcceptedPromptsByLines = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
    const breakdownsChartDataTop5AcceptedPromptsByCounts = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
    const chartOptions = brandPieChartOptions();
    const pieChartColors = ref([...brandPieChartColors]);

    const processBreakdownData = (data: Metrics[]) => {
      breakdownList.value = [];
      
      data.forEach((m: Metrics) => m.breakdown.forEach(breakdownData => 
      {
        const breakdownName = breakdownData[props.breakdownKey as keyof typeof breakdownData] as string;
        if (!breakdownName) {
          return;
        }
        let breakdown = breakdownList.value.find(b => b.name === breakdownName);

        if (!breakdown) {
          breakdown = new Breakdown({
            name: breakdownName,
            acceptedPrompts: breakdownData.acceptances_count,
            suggestedPrompts: breakdownData.suggestions_count,
            suggestedLinesOfCode: breakdownData.lines_suggested,
            acceptedLinesOfCode: breakdownData.lines_accepted,
          });
          breakdownList.value.push(breakdown);
        } else {
          breakdown.acceptedPrompts += breakdownData.acceptances_count;
          breakdown.suggestedPrompts += breakdownData.suggestions_count;
          breakdown.suggestedLinesOfCode += breakdownData.lines_suggested;
          breakdown.acceptedLinesOfCode += breakdownData.lines_accepted;
        }
        breakdown.acceptanceRateByCount = breakdown.suggestedPrompts !== 0 ? (breakdown.acceptedPrompts / breakdown.suggestedPrompts) * 100 : 0;
        breakdown.acceptanceRateByLines = breakdown.suggestedLinesOfCode !== 0 ? (breakdown.acceptedLinesOfCode / breakdown.suggestedLinesOfCode) * 100 : 0;
      }));

      breakdownList.value.sort((a, b) => b.acceptedPrompts - a.acceptedPrompts);
      const top5BreakdownsAcceptedPrompts = breakdownList.value.slice(0, 5);
      
      breakdownsChartDataTop5AcceptedPrompts.value = {
        labels: top5BreakdownsAcceptedPrompts.map(breakdown => breakdown.name),
        datasets: [{ data: top5BreakdownsAcceptedPrompts.map(breakdown => breakdown.acceptedPrompts), backgroundColor: pieChartColors.value }],
      };

      breakdownsChartDataTop5AcceptedPromptsByLines.value = {
        labels: top5BreakdownsAcceptedPrompts.map(breakdown => breakdown.name),
        datasets: [{ data: top5BreakdownsAcceptedPrompts.map(breakdown => breakdown.acceptanceRateByLines.toFixed(2)), backgroundColor: pieChartColors.value }],
      };

      breakdownsChartDataTop5AcceptedPromptsByCounts.value = {
        labels: top5BreakdownsAcceptedPrompts.map(breakdown => breakdown.name),
        datasets: [{ data: top5BreakdownsAcceptedPrompts.map(breakdown => breakdown.acceptanceRateByCount.toFixed(2)), backgroundColor: pieChartColors.value }],
      };

      numberOfBreakdowns.value = breakdownList.value.length;
    };

    watch(() => props.metrics, (newMetrics) => {
      if (newMetrics && Array.isArray(newMetrics)) {
        processBreakdownData(newMetrics);
      }
    }, { immediate: true, deep: true });

    return {
      t,
      chartTooltips,
      headers,
      entityPluralLabel,
      entityPluralLower,
      chartOptions,
      breakdownList,
      numberOfBreakdowns,
      breakdownsChartData,
      breakdownsChartDataTop5AcceptedPrompts,
      breakdownsChartDataTop5AcceptedPromptsByLines,
      breakdownsChartDataTop5AcceptedPromptsByCounts
    };
  },
});
</script>
