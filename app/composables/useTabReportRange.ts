import type { InjectionKey, Ref } from 'vue'

export const tabReportRangeKey: InjectionKey<Ref<string | null>> = Symbol('tabReportRange')

export function provideTabReportRange() {
  const reportRange = ref<string | null>(null)
  provide(tabReportRangeKey, reportRange)
  return reportRange
}

export function useTabReportRange() {
  return inject(tabReportRangeKey, ref<string | null>(null))
}
