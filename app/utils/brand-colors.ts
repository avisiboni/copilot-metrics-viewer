/** Menora Mivtachim brand palette (design-system/paleta.pdf, book25.pdf) */
export const brandColors = {
  primary: '#6436DF',
  primaryDark: '#320F5B',
  primaryLight: '#9766FD',
  lavender: '#DAD9EB',
  surface: '#F0F1F6',
  text: '#343546',
  accent: '#FFC700',
  turquoise: '#06C5D7',
  focus: '#B5B4C5',
} as const

/** Chart series colors for multi-team / breakdown visualizations */
export const brandChartPalette = [
  { bg: 'rgba(100, 54, 223, 0.2)', border: 'rgba(100, 54, 223, 1)' },
  { bg: 'rgba(151, 102, 253, 0.2)', border: 'rgba(151, 102, 253, 1)' },
  { bg: 'rgba(255, 199, 0, 0.25)', border: 'rgba(255, 199, 0, 1)' },
  { bg: 'rgba(6, 197, 215, 0.2)', border: 'rgba(6, 197, 215, 1)' },
  { bg: 'rgba(50, 15, 91, 0.2)', border: 'rgba(50, 15, 91, 1)' },
] as const

/** Distinct slice colors for pie/doughnut charts (avoid repeating purple-only tones). */
export const brandPieChartColors = [
  brandColors.primary,
  brandColors.turquoise,
  brandColors.accent,
  brandColors.primaryLight,
  '#0998AD',
  '#F967E4',
  brandColors.primaryDark,
  '#5B8DEF',
  '#E46651',
  '#41B883',
] as const

export function pieSliceColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => brandPieChartColors[i % brandPieChartColors.length]!)
}
