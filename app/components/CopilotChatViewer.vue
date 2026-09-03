<template>
    <div class="tiles-container">      
        <v-card variant="flat" class="brand-kpi-card">
            <BrandKpiTooltip :text="t('chat.kpiTooltipTurns')" />
            <v-card-item>
                <div class="tiles-text">
                    <div class="spacing-25"/>
                    <div class="text-h6 mb-1">{{ t('chat.cumulativeTurns') }}</div>
                    <div class="text-caption">{{ dateRangeDescription }}</div>
                    <p class="text-h4">{{ cumulativeNumberTurns }}</p>
                </div>
            </v-card-item>
        </v-card>

        <v-card variant="flat" class="brand-kpi-card">
            <BrandKpiTooltip :text="t('chat.kpiTooltipAcceptances')" />
            <v-card-item>
                <div class="tiles-text">
                    <div class="spacing-10"/>
                    <div class="text-h6 mb-1">{{ t('chat.cumulativeAcceptances') }}</div>
                    <div class="text-caption">{{ dateRangeDescription }}</div>
                    <p class="text-h4">{{ cumulativeNumberAcceptances }}</p>
                </div>
            </v-card-item>
        </v-card>
    </div>

    <section class="brand-page-panel">

            <BrandChartTitle
              :title="t('chat.chartAcceptancesTurns')"
              :tooltip="chartTooltips.chatAcceptancesAndTurns"
            />
            <Line :data="totalNumberAcceptancesAndTurnsChartData" :options="chartOptions" />

            <BrandChartTitle
              :title="t('chat.chartActiveUsers')"
              :tooltip="chartTooltips.chatActiveUsers"
            />
            <Bar :data="totalActiveCopilotChatUsersChartData" :options="totalActiveChatUsersChartOptions" />

            <BrandChartTitle
              :title="t('chat.chartByMode')"
              :tooltip="chartTooltips.chatRequestsByMode"
              wrapper-class="mt-6"
            />
            <Line :data="chatModeChartData" :options="chartOptions" />

    </section>
</template>
  
<script lang="ts">
  import { defineComponent, ref, toRef, watchEffect, type PropType } from 'vue';
  import type { Metrics } from '@/model/Metrics';
  import type { CopilotMetrics } from '@/model/Copilot_Metrics';
  import { useChartTooltips } from '@/utils/chart-tooltips';
  import { Line, Bar } from 'vue-chartjs'
  import {
    brandBarChartOptions,
    brandLineChartOptions,
    lineDataset,
    paletteEntry
  } from '@/utils/chart-theme'
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
name: 'CopilotChatViewer',
components: {
Bar,
Line
},
props: {
        metrics: {
            type: Object,
            required: true
        },
        dateRangeDescription: {
            type: String,
            default: 'Over the last 28 days'
        },
        usage: {
            type: Array as PropType<CopilotMetrics[]>,
            default: () => []
        }
    },
setup(props) {
    const chartTooltips = useChartTooltips()
    const { t } = useAppI18n()

    const cumulativeNumberAcceptances = ref(0);

    const cumulativeNumberTurns = ref(0);

    //Total Copilot Chat Active Users
    const totalActiveCopilotChatUsersChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });  

    const totalActiveChatUsersChartOptions = brandBarChartOptions({
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    });

    const chartOptions = brandLineChartOptions();

    //Total Number Acceptances And Turns
    const totalNumberAcceptancesAndTurnsChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
    const chatModeChartData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });

    watchEffect(() => {
      const data = toRef(props, 'metrics').value;
      const translate = t.value
      if (!data?.length) return;

      cumulativeNumberTurns.value = 0;
      const cumulativeNumberTurnsData = data.map((m: Metrics) => {
        cumulativeNumberTurns.value += m.total_chat_turns;
        return m.total_chat_turns;
      });

      cumulativeNumberAcceptances.value = 0;
      const cumulativeNumberAcceptancesData = data.map((m: Metrics) => {
        cumulativeNumberAcceptances.value += m.total_chat_acceptances;
        return m.total_chat_acceptances;
      });

      totalNumberAcceptancesAndTurnsChartData.value = {
        labels: data.map((m: Metrics) => m.day),
        datasets: [
          lineDataset(translate('chat.legendAcceptances'), cumulativeNumberAcceptancesData, 0),
          lineDataset(translate('chat.legendTurns'), cumulativeNumberTurnsData, 1)
        ]
      };

      totalActiveCopilotChatUsersChartData.value = {
        labels: data.map((m: Metrics) => m.day),
        datasets: [
          {
            label: translate('chat.legendActiveUsers'),
            data: data.map((m: Metrics) => m.total_active_chat_users),
            backgroundColor: paletteEntry(2).bg,
            borderColor: paletteEntry(2).border,
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      };

      const usageData = toRef(props, 'usage').value || [];
      const modes = ['ask', 'edit', 'plan', 'agent', 'custom', 'unknown'] as const;
      const modeLabels: Record<(typeof modes)[number], string> = {
        ask: translate('chat.modeAsk'),
        edit: translate('chat.modeEdit'),
        plan: translate('chat.modePlan'),
        agent: translate('chat.modeAgent'),
        custom: translate('chat.modeCustom'),
        unknown: translate('chat.modeUnknown'),
      };
      chatModeChartData.value = {
        labels: usageData.map((m) => m.date),
        datasets: modes.map((mode, index) =>
          lineDataset(
            modeLabels[mode],
            usageData.map((metric) => {
              const breakdown = (metric.copilot_ide_chat as {
                chat_mode_breakdown?: Array<{ mode: string; total_chats?: number }>
              })?.chat_mode_breakdown;
              return breakdown?.find((item) => item.mode === mode)?.total_chats || 0;
            }),
            index
          )
        )
      };
    });

    return {
      t,
      chartTooltips,
      totalActiveCopilotChatUsersChartData,
      totalActiveChatUsersChartOptions,
      cumulativeNumberAcceptances,
      cumulativeNumberTurns,
      totalNumberAcceptancesAndTurnsChartData,
      chatModeChartData,
      chartOptions
    };
}
});

</script>
