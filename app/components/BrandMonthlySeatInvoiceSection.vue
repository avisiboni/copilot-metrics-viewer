<template>
  <section class="brand-page-panel mb-4 seats-monthly-section">
    <div class="d-flex flex-wrap align-center justify-space-between gap-2 mb-2">
      <div>
        <h2 class="text-h6 mb-1">{{ title }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <BrandDismissibleAlert
      v-if="seatUnitPrice <= 0"
      storage-key="seats-unit-price-hint"
      :close-label="t('common.close')"
      density="comfortable"
      alert-class="brand-alert brand-alert--info"
    >
      {{ t('billing.seatCostUnitPriceHint') }}
    </BrandDismissibleAlert>

    <BrandDismissibleAlert
      v-if="historicalMode && !historyLoading && !monthlyRows.length"
      storage-key="seats-monthly-historical-empty"
      :close-label="t('common.close')"
      density="comfortable"
      alert-class="brand-alert brand-alert--info"
    >
      {{ t('seats.monthlyHistoricalEmpty') }}
    </BrandDismissibleAlert>

    <BrandDismissibleAlert
      v-else-if="!historicalMode && showHistoricalHint"
      storage-key="seats-monthly-enable-historical"
      :close-label="t('common.close')"
      density="comfortable"
      alert-class="brand-alert brand-alert--info"
    >
      {{ t('seats.monthlyEnableHistorical') }}
    </BrandDismissibleAlert>

    <v-row v-if="monthlyTableItems.length" dense class="seats-monthly-row">
      <v-col v-if="showChart" cols="12">
        <div class="brand-chart-surface seats-monthly-chart w-100">
          <Bar v-if="monthlyChartData" :data="monthlyChartData" :options="monthlyChartOptions" />
        </div>
      </v-col>
      <v-col cols="12">
        <BrandTableShell
          class="seats-monthly-table w-100"
          :title="title"
          :subtitle="subtitle"
        >
          <v-data-table
            :headers="monthlyHeaders"
            :items="monthlyTableItems"
            :items-per-page="24"
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
            <template #item.existing_cost_label="{ item }">
              <span class="brand-table-metric">{{ item.existing_cost_label }}</span>
            </template>
            <template #item.new_cost_label="{ item }">
              <span class="brand-table-metric">{{ item.new_cost_label }}</span>
            </template>
            <template #item.monthly_cost_label="{ item }">
              <span class="brand-table-metric font-weight-bold">{{ item.monthly_cost_label }}</span>
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
                <template v-if="seatUnitPrice > 0">
                  <td class="text-end font-weight-bold brand-table-metric">
                    {{ monthlyTotals.existing_cost_label }}
                  </td>
                  <td class="text-end font-weight-bold brand-table-metric">
                    {{ monthlyTotals.new_cost_label }}
                  </td>
                  <td class="text-end font-weight-bold brand-table-metric">
                    {{ monthlyTotals.monthly_cost_label }}
                  </td>
                </template>
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
</template>

<script lang="ts">
import { computed, defineComponent, toRef } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js'
import type { Seat } from '@/model/Seat'
import BrandTableShell from '@/components/BrandTableShell.vue'
import BrandDismissibleAlert from '@/components/BrandDismissibleAlert.vue'
import { useMonthlySeatInvoice } from '@/composables/useMonthlySeatInvoice'
import {
  brandBarChartOptionsWithLegend,
  brandChartOptionsInContainer
} from '@/utils/chart-theme'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default defineComponent({
  name: 'BrandMonthlySeatInvoiceSection',
  components: { Bar, BrandTableShell, BrandDismissibleAlert },
  props: {
    seats: {
      type: Array as () => Seat[],
      default: () => []
    },
    showChart: {
      type: Boolean,
      default: false
    },
    showHistoricalHint: {
      type: Boolean,
      default: true
    },
    useBillingTitle: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { t } = useAppI18n()
    const seatsRef = toRef(props, 'seats')
    const invoice = useMonthlySeatInvoice(seatsRef)

    const monthlyChartOptions = brandBarChartOptionsWithLegend({
      ...brandChartOptionsInContainer,
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    })

    const monthlyChartData = computed(() => {
      if (!invoice.monthlyTableItems.value.length) return null
      return {
        labels: invoice.monthlyTableItems.value.map((row) => row.monthLabel),
        datasets: [
          {
            label: t.value('seats.monthlyColExisting'),
            data: invoice.monthlyTableItems.value.map((row) => row.existing_seats),
            backgroundColor: '#C4B5FD',
            borderRadius: 4,
            stack: 'seats'
          },
          {
            label: t.value('seats.monthlyColNew'),
            data: invoice.monthlyTableItems.value.map((row) => row.new_seats),
            backgroundColor: '#7C3AED',
            borderRadius: 4,
            stack: 'seats'
          }
        ]
      }
    })

    const title = computed(() =>
      props.useBillingTitle ? t.value('billing.seatCostTitle') : t.value('seats.monthlyTitle')
    )

    const subtitle = computed(() => {
      if (props.useBillingTitle && invoice.seatUnitPrice.value > 0) {
        return t.value('billing.seatCostSubtitle', {
          price: new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: 'USD'
          }).format(invoice.seatUnitPrice.value)
        })
      }
      return invoice.monthlySubtitle.value
    })

    return {
      t,
      title,
      subtitle,
      monthlyChartOptions,
      monthlyChartData,
      ...invoice
    }
  }
})
</script>

<style scoped>
.seats-monthly-row {
  margin-top: 0.25rem;
}

.seats-monthly-chart {
  min-height: 280px;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.seats-monthly-chart :deep(> div) {
  position: relative;
  height: 100%;
  min-height: 240px;
}

.seats-monthly-chart :deep(canvas) {
  max-height: 280px;
}

.seats-monthly-table {
  width: 100%;
}

.seats-monthly-total-row td {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface-variant), 0.35);
}
</style>
