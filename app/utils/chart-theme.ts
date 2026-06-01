import type { ChartOptions } from 'chart.js'
import { brandChartPalette, brandColors, brandPieChartColors, pieSliceColors } from './brand-colors'

const chartFont = {
  family: "'Assistant', Arial, sans-serif",
  size: 12
}

const tickColor = brandColors.text
const gridColor = 'rgba(100, 54, 223, 0.1)'

/** Vuetify autocomplete / select dropdown — opaque menu above alerts. */
export const brandSelectMenuProps = {
  contentClass: 'brand-select-menu',
  maxHeight: 320,
  zIndex: 2400,
  scrim: false,
  offset: 8
} as const

export function paletteEntry(index: number) {
  return brandChartPalette[index % brandChartPalette.length]!
}

export function lineDataset(
  label: string,
  data: number[],
  index = 0,
  extra: Record<string, unknown> = {}
) {
  const c = paletteEntry(index)
  return {
    label,
    data,
    backgroundColor: c.bg,
    borderColor: c.border,
    borderWidth: 2,
    tension: 0.25,
    fill: false,
    ...extra
  }
}

export function barDataset(
  label: string,
  data: number[],
  index = 0,
  extra: Record<string, unknown> = {}
) {
  const c = paletteEntry(index)
  return {
    label,
    data,
    backgroundColor: c.bg,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 6,
    ...extra
  }
}

function basePlugins(): ChartOptions['plugins'] {
  return {
    legend: {
      labels: {
        color: tickColor,
        font: chartFont,
        boxWidth: 12,
        padding: 14
      }
    },
    tooltip: {
      backgroundColor: brandColors.primaryDark,
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: brandColors.primaryLight,
      borderWidth: 1,
      padding: 10,
      titleFont: { ...chartFont, weight: 'bold' as const },
      bodyFont: chartFont
    }
  }
}

/** Use when the chart sits in a fixed-height container (e.g. `.brand-chart-surface`). */
export const brandChartOptionsInContainer: Pick<
  ChartOptions,
  'maintainAspectRatio' | 'responsive'
> = {
  responsive: true,
  maintainAspectRatio: false
}

export function brandLineChartOptions(
  overrides: ChartOptions<'line'> = {}
): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        ticks: { color: tickColor, font: chartFont },
        grid: { color: gridColor }
      },
      y: {
        beginAtZero: true,
        ticks: { color: tickColor, font: chartFont },
        grid: { color: gridColor }
      }
    },
    plugins: basePlugins(),
    ...overrides
  }
}

export function brandBarChartOptions(
  overrides: ChartOptions<'bar'> = {}
): ChartOptions<'bar'> {
  return {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      x: {
        ticks: {
          color: tickColor,
          font: chartFont,
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true
        },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { color: tickColor, font: chartFont },
        grid: { color: gridColor }
      }
    },
    plugins: {
      ...basePlugins(),
      legend: { display: false }
    },
    ...overrides
  }
}

export function brandBarChartOptionsWithLegend(
  overrides: ChartOptions<'bar'> = {}
): ChartOptions<'bar'> {
  return {
    ...brandBarChartOptions(),
    plugins: {
      ...basePlugins(),
      legend: {
        position: 'top',
        labels: {
          color: tickColor,
          font: chartFont,
          boxWidth: 12,
          padding: 14
        }
      }
    },
    ...overrides
  }
}

export function brandPieChartOptions(
  overrides: ChartOptions<'pie'> = {}
): ChartOptions<'pie'> {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      ...basePlugins(),
      legend: {
        position: 'bottom',
        labels: {
          color: tickColor,
          font: chartFont,
          boxWidth: 12,
          padding: 12
        }
      }
    },
    ...overrides
  }
}
