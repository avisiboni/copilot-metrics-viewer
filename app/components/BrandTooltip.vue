<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    text?: string
    location?:
      | 'top'
      | 'bottom'
      | 'bottom end'
      | 'bottom start'
      | 'top end'
      | 'top start'
      | 'start'
      | 'end'
    maxWidth?: number | string
    zIndex?: number
    openDelay?: number
    closeDelay?: number
    /** When set, attaches to the parent element (e.g. icon button). */
    activator?: 'parent'
  }>(),
  {
    location: 'bottom end',
    openDelay: 200,
    closeDelay: 200,
  }
)

const slots = useSlots()

const showTooltip = computed(
  () => Boolean(props.text?.trim() || slots.default || slots.activator)
)
</script>

<template>
  <v-tooltip
    v-if="showTooltip"
    :activator="activator"
    :location="location"
    :max-width="maxWidth"
    :z-index="zIndex"
    open-on-hover
    :open-delay="openDelay"
    :close-delay="closeDelay"
    content-class="brand-tooltip-overlay"
  >
    <template v-if="!activator" #activator="activatorProps">
      <slot name="activator" v-bind="activatorProps" />
    </template>
    <slot>
      <v-card v-if="text" class="pa-3 brand-tooltip-card brand-kpi-tooltip__panel">
        <p class="brand-kpi-tooltip__text">{{ text }}</p>
      </v-card>
    </slot>
  </v-tooltip>
</template>
