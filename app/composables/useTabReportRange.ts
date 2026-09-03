import type { InjectionKey, Ref } from 'vue'

export const tabReportRangeKey: InjectionKey<Ref<string | null>> = Symbol('tabReportRange')
export const tabBillingRangeKey: InjectionKey<Ref<string | null>> = Symbol('tabBillingRange')

export function provideTabReportRange() {
  const reportRange = ref<string | null>(null)
  const billingRange = ref<string | null>(null)
  provide(tabReportRangeKey, reportRange)
  provide(tabBillingRangeKey, billingRange)
  return { reportRange, billingRange }
}

export function useTabReportRange() {
  return inject(tabReportRangeKey, ref<string | null>(null))
}

export function useTabBillingRange() {
  return inject(tabBillingRangeKey, ref<string | null>(null))
}
