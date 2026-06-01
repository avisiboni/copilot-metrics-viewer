<template>
  <v-dialog
    :model-value="modelValue"
    max-width="880"
    scrollable
    content-class="billing-sku-detail-dialog"
    scrim="rgba(15, 23, 42, 0.55)"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="billing-sku-detail" elevation="8">
      <v-card-title class="billing-sku-detail__header d-flex align-start justify-space-between">
        <div>
          <div class="text-h6">{{ t('billing.skuDetailTitle') }}</div>
          <div v-if="reportRange" class="text-body-2 text-medium-emphasis mt-1">
            {{ reportRange }}
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          :aria-label="t('common.close')"
          @click="emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="billing-sku-detail__body">
        <v-row class="mb-4" dense>
          <v-col cols="6" sm="4">
            <v-card variant="flat" class="brand-kpi-card">
              <div class="brand-kpi-card__body py-3">
                <div class="brand-kpi-card__label">{{ t('billing.kpiNetSpend') }}</div>
                <div class="brand-kpi-card__value text-h5">{{ formatCurrency(totalNetSpend) }}</div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="6" sm="4">
            <v-card variant="flat" class="brand-kpi-card">
              <div class="brand-kpi-card__body py-3">
                <div class="brand-kpi-card__label">{{ t('billing.skuDetailLineTypes') }}</div>
                <div class="brand-kpi-card__value text-h5">{{ skuCosts.length }}</div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <BrandTableShell
          :title="t('billing.skuDetailTableTitle')"
          :subtitle="t('billing.skuDetailTableSubtitle')"
        >
          <v-data-table
            :headers="headers"
            :items="tableRows"
            :items-per-page="-1"
            hide-default-footer
            density="comfortable"
            class="brand-data-table"
          >
            <template #item.sku="{ item }">
              <span class="billing-sku-detail__sku">{{ item.sku }}</span>
            </template>
            <template #item.quantity="{ item }">
              <span class="brand-table-metric">{{ formatNumber(item.quantity) }}</span>
            </template>
            <template #item.grossAmount="{ item }">
              <span class="brand-table-metric">{{ formatCurrency(item.grossAmount) }}</span>
            </template>
            <template #item.netAmount="{ item }">
              <span class="brand-table-metric">{{ formatCurrency(item.netAmount) }}</span>
            </template>
            <template #item.shareOfSpend="{ item }">
              <span class="brand-table-metric">{{ formatPercent(item.shareOfSpend) }}</span>
            </template>
            <template #body.append>
              <tr class="billing-sku-detail__total-row">
                <td class="font-weight-bold">{{ t('billing.skuDetailTotal') }}</td>
                <td class="text-end font-weight-bold brand-table-metric">
                  {{ formatNumber(totalQuantity) }}
                </td>
                <td class="text-end font-weight-bold brand-table-metric">
                  {{ formatCurrency(totalGross) }}
                </td>
                <td class="text-end font-weight-bold brand-table-metric">
                  {{ formatCurrency(totalNetSpend) }}
                </td>
                <td class="text-end font-weight-bold brand-table-metric">100%</td>
              </tr>
            </template>
          </v-data-table>
        </BrandTableShell>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import BrandTableShell from '@/components/BrandTableShell.vue'
import type { SkuCostAggregate } from '../../shared/types/usage-insights'

export default defineComponent({
  name: 'BillingSkuDetailDialog',
  components: { BrandTableShell },
  props: {
    modelValue: { type: Boolean, required: true },
    skuCosts: {
      type: Array as () => SkuCostAggregate[],
      default: () => []
    },
    totalNetSpend: { type: Number, default: 0 },
    reportRange: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useAppI18n()

    const formatCurrency = (n: number) =>
      new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)

    const formatNumber = (n: number) => new Intl.NumberFormat().format(n)

    const formatPercent = (share: number) =>
      new Intl.NumberFormat(undefined, {
        style: 'percent',
        maximumFractionDigits: 1
      }).format(share)

    const tableRows = computed(() => {
      const total = props.totalNetSpend || 0
      return props.skuCosts.map((row) => ({
        ...row,
        shareOfSpend: total > 0 ? row.netAmount / total : 0
      }))
    })

    const totalQuantity = computed(() =>
      props.skuCosts.reduce((sum, row) => sum + row.quantity, 0)
    )

    const totalGross = computed(() =>
      props.skuCosts.reduce((sum, row) => sum + row.grossAmount, 0)
    )

    const headers = computed(() => [
      { title: t.value('billing.colSku'), key: 'sku', minWidth: '220px' },
      { title: t.value('billing.colQuantity'), key: 'quantity', align: 'end' as const },
      { title: t.value('billing.colGrossAmount'), key: 'grossAmount', align: 'end' as const },
      { title: t.value('billing.colNetAmount'), key: 'netAmount', align: 'end' as const },
      { title: t.value('billing.colShareOfSpend'), key: 'shareOfSpend', align: 'end' as const }
    ])

    return {
      t,
      emit,
      headers,
      tableRows,
      totalQuantity,
      totalGross,
      formatCurrency,
      formatNumber,
      formatPercent
    }
  }
})
</script>

<style scoped>
.billing-sku-detail {
  background: #ffffff !important;
}

.billing-sku-detail__header {
  padding: 20px 24px 16px;
  background: #ffffff;
}

.billing-sku-detail__body {
  padding: 16px 24px 24px;
  background: #ffffff;
}

.billing-sku-detail :deep(.brand-kpi-card.v-card) {
  background: #ffffff !important;
  border: 1px solid #e4e4ec;
  min-height: auto;
  box-shadow: none !important;
}

.billing-sku-detail :deep(.brand-kpi-card.v-card::before),
.billing-sku-detail :deep(.brand-kpi-card.v-card::after) {
  display: none;
}

.billing-sku-detail__sku {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.875rem;
}

.billing-sku-detail__total-row td {
  border-top: 2px solid rgba(15, 23, 42, 0.12);
  padding-top: 12px !important;
}
</style>
