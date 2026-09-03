import type { Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Seat } from '@/model/Seat'
import { Options } from '@/model/Options'
import { isEnvTruthy } from '../../shared/utils/env-boolean'
import { DEFAULT_COPILOT_SEAT_UNIT_PRICE_USD } from '../../shared/config/seat-pricing'
import {
  aggregateSeatHistoryByMonth,
  aggregateSeatsAssignedByMonth,
  applyMonthlySeatUnitPrice,
  buildMonthlySeatInvoiceRows,
  fillMonthlyCountGaps,
  fillMonthlyCountGapsHistorical,
  formatSeatMonthLabel,
  type SeatHistorySnapshot
} from '../../shared/utils/seats-monthly-aggregate'

export function useMonthlySeatInvoice(seats: Ref<Seat[]>) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const { t, apiLocale } = useAppI18n()

  const historicalMode = computed(() => isEnvTruthy(config.public.enableHistoricalMode))
  const seatHistory = ref<SeatHistorySnapshot[]>([])
  const historyLoading = ref(false)

  const seatUnitPrice = computed(() => {
    const fromConfig = Number(config.public.copilotSeatUnitPrice)
    // Stale Nuxt processes may still expose baked-in 35 from an older .env —
    // force the current org rate ($18) until that process is fully restarted.
    if (fromConfig === 35) return DEFAULT_COPILOT_SEAT_UNIT_PRICE_USD
    if (Number.isFinite(fromConfig) && fromConfig > 0) return fromConfig
    return DEFAULT_COPILOT_SEAT_UNIT_PRICE_USD
  })

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)

  async function loadSeatHistory() {
    if (!historicalMode.value) {
      seatHistory.value = []
      return
    }
    historyLoading.value = true
    try {
      const options = Options.fromRoute(route)
      seatHistory.value = await $fetch<SeatHistorySnapshot[]>('/api/seats-history', {
        query: options.toParams()
      })
    } catch {
      seatHistory.value = []
    } finally {
      historyLoading.value = false
    }
  }

  onMounted(() => {
    void loadSeatHistory()
  })

  const monthlyFromHistory = computed(() => aggregateSeatHistoryByMonth(seatHistory.value))

  const monthlyFromAssignments = computed(() => aggregateSeatsAssignedByMonth(seats.value))

  const monthlyRows = computed(() => {
    if (monthlyFromHistory.value.length > 0) {
      return monthlyFromHistory.value
    }
    return monthlyFromAssignments.value
  })

  const usesHistoricalMonthly = computed(() => monthlyFromHistory.value.length > 0)

  const monthlySubtitle = computed(() =>
    usesHistoricalMonthly.value
      ? t.value('seats.monthlySubtitleHistorical')
      : t.value('seats.monthlySubtitleAssigned')
  )

  const monthlyInvoiceRows = computed(() => {
    const mode = usesHistoricalMonthly.value ? 'historical' : 'assignments'
    const counts = usesHistoricalMonthly.value
      ? fillMonthlyCountGapsHistorical(monthlyRows.value)
      : fillMonthlyCountGaps(monthlyRows.value)
    return buildMonthlySeatInvoiceRows(counts, mode)
  })

  const monthlyTableItems = computed(() =>
    applyMonthlySeatUnitPrice(monthlyInvoiceRows.value, seatUnitPrice.value).map((row) => ({
      ...row,
      monthLabel: formatSeatMonthLabel(row.month, apiLocale.value),
      existing_cost_label: formatCurrency(row.existing_cost),
      new_cost_label: formatCurrency(row.new_cost),
      monthly_cost_label: formatCurrency(row.monthly_cost)
    }))
  )

  const monthlyTotals = computed(() => {
    const rows = monthlyTableItems.value
    const last = rows.at(-1)
    if (!last) return null
    return {
      new_seats: rows.reduce((sum, row) => sum + row.new_seats, 0),
      total_seats: last.total_seats,
      existing_cost: rows.reduce((sum, row) => sum + row.existing_cost, 0),
      new_cost: rows.reduce((sum, row) => sum + row.new_cost, 0),
      monthly_cost: rows.reduce((sum, row) => sum + row.monthly_cost, 0),
      existing_cost_label: formatCurrency(rows.reduce((sum, row) => sum + row.existing_cost, 0)),
      new_cost_label: formatCurrency(rows.reduce((sum, row) => sum + row.new_cost, 0)),
      monthly_cost_label: formatCurrency(rows.reduce((sum, row) => sum + row.monthly_cost, 0))
    }
  })

  const monthlyHeaders = computed(() => {
    const headers = [
      { title: t.value('seats.monthlyColMonth'), key: 'monthLabel' },
      { title: t.value('seats.monthlyColNew'), key: 'new_seats', align: 'end' as const },
      { title: t.value('seats.monthlyColExisting'), key: 'existing_seats', align: 'end' as const },
      { title: t.value('seats.monthlyColTotal'), key: 'total_seats', align: 'end' as const }
    ]
    if (seatUnitPrice.value > 0) {
      headers.push(
        {
          title: t.value('billing.seatCostColExisting'),
          key: 'existing_cost_label',
          align: 'end' as const,
          sortable: false
        },
        {
          title: t.value('billing.seatCostColNew'),
          key: 'new_cost_label',
          align: 'end' as const,
          sortable: false
        },
        {
          title: t.value('billing.seatCostColMonth'),
          key: 'monthly_cost_label',
          align: 'end' as const,
          sortable: false
        }
      )
    }
    if (usesHistoricalMonthly.value) {
      headers.push({
        title: t.value('seats.monthlyColSnapshot'),
        key: 'snapshot_date',
        sortable: false
      })
    }
    return headers
  })

  return {
    historicalMode,
    historyLoading,
    seatUnitPrice,
    monthlySubtitle,
    monthlyTableItems,
    monthlyTotals,
    monthlyHeaders,
    usesHistoricalMonthly,
    monthlyRows
  }
}
