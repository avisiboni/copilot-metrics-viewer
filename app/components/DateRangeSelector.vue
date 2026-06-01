<template>
  <v-expansion-panels
    v-model="panelOpen"
    class="date-range-panel"
    variant="accordion"
  >
    <v-expansion-panel value="open">
      <v-expansion-panel-title class="date-range-panel__title">
        <div class="date-range-panel__summary">
          <v-icon size="small" class="me-2">mdi-calendar-range</v-icon>
          <span class="date-range-panel__applied">{{ appliedSummary }}</span>
          <span v-if="reportSuffix" class="date-range-panel__report">{{ reportSuffix }}</span>
        </div>
      </v-expansion-panel-title>

      <v-expansion-panel-text class="date-range-panel__body">
        <div class="date-range-panel__toolbar">
          <v-text-field
            v-model="fromDate"
            class="date-range-panel__date-field brand-date-field"
            :label="t('dateRange.from')"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
          />
          <v-text-field
            v-model="toDate"
            class="date-range-panel__date-field brand-date-field"
            :label="t('dateRange.to')"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
          />
          <v-checkbox
            v-model="excludeHolidays"
            class="date-range-panel__checkbox"
            :label="t('dateRange.excludeHolidays')"
            density="compact"
            hide-details
          />
          <div class="date-range-panel__actions">
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              class="date-range-panel__action-btn"
              @click="resetToDefault"
            >
              {{ t('dateRange.last28Days') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              class="date-range-panel__action-btn date-range-panel__apply-btn"
              :loading="loading"
              @click="applyDateRange"
            >
              {{ t('common.apply') }}
            </v-btn>
          </div>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  loading?: boolean
  reportRange?: string | null
}

interface Emits {
  (e: 'date-range-changed', value: {
    since?: string
    until?: string
    description: string
    excludeHolidays?: boolean
  }): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  reportRange: null
})

const emit = defineEmits<Emits>()
const { t, apiLocale } = useAppI18n()

const panelOpen = ref<string | undefined>(undefined)

const today = new Date()
const defaultFromDate = new Date(today.getTime() - 27 * 24 * 60 * 60 * 1000)

const fromDate = ref(formatDate(defaultFromDate))
const toDate = ref(formatDate(today))
const excludeHolidays = ref(false)

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] || ''
}

function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z')
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString(apiLocale.value, { day: 'numeric', month: 'short', year: 'numeric' })
}

function dayCount(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

function isLast28Days(): boolean {
  if (!fromDate.value || !toDate.value) return false

  const expectedFromDate = new Date(today.getTime() - 27 * 24 * 60 * 60 * 1000)
  const from = parseDate(fromDate.value)
  const to = parseDate(toDate.value)

  return (
    from.toDateString() === expectedFromDate.toDateString() &&
    to.toDateString() === today.toDateString()
  )
}

const holidayNoteShort = computed(() =>
  excludeHolidays.value ? t.value('dateRange.exclHolidays') : ''
)

const appliedSummary = computed(() => {
  if (!fromDate.value || !toDate.value) {
    return t.value('dateRange.selectRange')
  }

  const from = parseDate(fromDate.value)
  const to = parseDate(toDate.value)
  const days = dayCount(from, to)
  const holidayNote = holidayNoteShort.value

  if (days === 1) {
    return t.value('dateRange.summarySingle', {
      date: formatShortDate(from),
      holidayNote,
    })
  }
  if (days <= 28 && isLast28Days()) {
    return t.value('dateRange.summaryLast28', { holidayNote })
  }
  return t.value('dateRange.summaryRange', {
    from: formatShortDate(from),
    to: formatShortDate(to),
    days,
    holidayNote,
  })
})

const reportSuffix = computed(() => {
  const report = props.reportRange?.trim()
  if (!report) return ''

  const normalized = report.replace(/\s*→\s*/g, '–').replace(/^Day:\s*/i, '')
  const applied = `${fromDate.value}_${toDate.value}`
  if (applied.includes(fromDate.value) && applied.includes(toDate.value) && normalized.includes(fromDate.value)) {
    return ''
  }
  return t.value('dateRange.reportSuffix', { range: normalized })
})

const dateRangeText = computed(() => {
  if (!fromDate.value || !toDate.value) {
    return t.value('dateRange.selectRange')
  }

  const from = parseDate(fromDate.value)
  const to = parseDate(toDate.value)
  const diffDays = dayCount(from, to)
  const holidayNote = excludeHolidays.value ? t.value('dateRange.excludingHolidays') : ''

  if (diffDays === 1) {
    return t.value('dateRange.forSingleDay', {
      date: from.toLocaleDateString(apiLocale.value),
      holidayNote,
    })
  }
  if (diffDays <= 28 && isLast28Days()) {
    return t.value('dateRange.overLast28', { holidayNote })
  }
  return t.value('dateRange.fromTo', {
    from: from.toLocaleDateString(apiLocale.value),
    to: to.toLocaleDateString(apiLocale.value),
    days: diffDays,
    holidayNote,
  })
})

function resetToDefault() {
  const now = new Date()
  const defaultFrom = new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000)

  fromDate.value = formatDate(defaultFrom)
  toDate.value = formatDate(now)
}

function applyDateRange() {
  if (!fromDate.value || !toDate.value) {
    return
  }

  const from = parseDate(fromDate.value)
  const to = parseDate(toDate.value)

  if (from > to) {
    const temp = fromDate.value
    fromDate.value = toDate.value
    toDate.value = temp
  }

  emit('date-range-changed', {
    since: fromDate.value,
    until: toDate.value,
    description: dateRangeText.value,
    excludeHolidays: excludeHolidays.value
  })
}

onMounted(() => {
  applyDateRange()
})
</script>

<style scoped>
.date-range-panel {
  width: 100%;
  max-width: 100%;
  margin: 0 0 14px;
}

.date-range-panel :deep(.v-expansion-panels) {
  border-radius: var(--brand-radius-md);
}

.date-range-panel :deep(.v-expansion-panel) {
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--brand-lavender) 80%, white);
  border-radius: var(--brand-radius-md) !important;
  box-shadow: 0 2px 8px rgba(50, 15, 91, 0.06);
  overflow: hidden;
}

.date-range-panel :deep(.v-expansion-panel-title) {
  min-height: 48px;
  padding: 10px 16px;
}

.date-range-panel :deep(.v-expansion-panel-title__overlay) {
  opacity: 0 !important;
}

.date-range-panel :deep(.v-expansion-panel-title:hover) {
  background: color-mix(in srgb, var(--brand-lavender) 25%, white);
}

.date-range-panel__summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  font-size: 0.8125rem;
  line-height: 1.3;
  color: var(--brand-text);
}

.date-range-panel__applied {
  font-weight: 600;
}

.date-range-panel__report {
  font-weight: 500;
  color: var(--brand-primary);
  font-size: 0.75rem;
}

.date-range-panel__body {
  padding-top: 0;
  border-top: 1px solid color-mix(in srgb, var(--brand-lavender) 60%, white);
}

.date-range-panel__toolbar {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px 10px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.date-range-panel__date-field {
  flex: 0 0 10.5rem;
  min-width: 10.5rem;
}

.date-range-panel__checkbox {
  flex: 0 1 auto;
  min-width: 0;
}

.date-range-panel__checkbox :deep(.v-label) {
  white-space: nowrap;
}

.date-range-panel__actions {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  margin-inline-start: auto;
}

.date-range-panel__action-btn {
  flex: 0 0 auto;
  white-space: nowrap;
}

.date-range-panel__apply-btn {
  background-color: var(--brand-primary) !important;
  color: #fff !important;
}

.date-range-panel__apply-btn:hover,
.date-range-panel__apply-btn:focus-visible {
  background-color: var(--brand-primary-dark) !important;
  color: #fff !important;
}

.date-range-panel__apply-btn :deep(.v-btn__content) {
  color: #fff !important;
}
</style>
