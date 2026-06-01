<template>
  <v-expansion-panels
    v-model="panelOpen"
    class="brand-collapsible-alert mb-4"
    :class="`brand-collapsible-alert--${variant}`"
    variant="accordion"
  >
    <v-expansion-panel value="details">
      <v-expansion-panel-title class="brand-collapsible-alert__title">
        <v-icon :icon="icon" size="small" class="me-2 flex-shrink-0" />
        <span class="brand-collapsible-alert__heading">{{ title }}</span>
        <span
          v-if="summary && !isExpanded"
          class="brand-collapsible-alert__summary text-medium-emphasis"
        >
          — {{ summary }}
        </span>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="brand-collapsible-alert__body">
        <slot />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'BrandCollapsibleBillingAlert',
  props: {
    title: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      default: ''
    },
    variant: {
      type: String as () => 'info' | 'warning',
      default: 'info'
    },
    defaultOpen: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const panelOpen = ref<string | undefined>(
      props.defaultOpen ? 'details' : undefined
    )
    const isExpanded = computed(() => panelOpen.value === 'details')
    const icon = computed(() =>
      props.variant === 'warning' ? 'mdi-alert-circle-outline' : 'mdi-information-outline'
    )
    return { panelOpen, isExpanded, icon }
  }
})
</script>

<style scoped>
.brand-collapsible-alert :deep(.v-expansion-panel) {
  border-radius: var(--brand-radius-md, 8px) !important;
  box-shadow: none;
}

.brand-collapsible-alert :deep(.v-expansion-panel-title) {
  min-height: 48px;
  padding: 10px 14px;
  font-weight: 600;
  color: var(--brand-primary-dark);
}

.brand-collapsible-alert :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 14px 14px;
}

.brand-collapsible-alert__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  line-height: 1.35;
}

.brand-collapsible-alert__heading {
  font-weight: 600;
}

.brand-collapsible-alert__summary {
  font-weight: 400;
  font-size: 0.8125rem;
  flex: 1 1 auto;
  min-width: 0;
}

.brand-collapsible-alert__body {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--brand-text);
}

.brand-collapsible-alert__body :deep(code) {
  font-size: 0.8125rem;
}

.brand-collapsible-alert--info :deep(.v-expansion-panel) {
  background-color: color-mix(in srgb, var(--brand-turquoise) 18%, white) !important;
  border: 1px solid color-mix(in srgb, var(--brand-turquoise) 45%, white);
}

.brand-collapsible-alert--warning :deep(.v-expansion-panel) {
  background-color: color-mix(in srgb, var(--brand-accent) 40%, white) !important;
  border: 1px solid color-mix(in srgb, var(--brand-accent) 70%, white);
}
</style>
