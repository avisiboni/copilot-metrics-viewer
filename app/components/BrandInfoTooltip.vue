<script setup lang="ts">
const { t } = useAppI18n()

withDefaults(
  defineProps<{
    text: string
    ariaLabel?: string
    location?: 'top' | 'bottom' | 'bottom end' | 'bottom start' | 'top end' | 'top start'
    iconSize?: number | string
    buttonClass?: string
  }>(),
  {
    location: 'bottom end',
    iconSize: 18,
    buttonClass: 'brand-chart-title__info'
  }
)
</script>

<template>
  <v-tooltip
    v-if="text"
    :location="location"
    open-on-hover
    open-delay="200"
    close-delay="200"
  >
    <template #activator="{ props: tipProps }">
      <button
        type="button"
        :class="buttonClass"
        v-bind="tipProps"
        :aria-label="ariaLabel ?? t('common.aboutKpi')"
        @click.stop
      >
        <v-icon icon="mdi-information-outline" :size="iconSize" />
      </button>
    </template>
    <v-card class="pa-3 brand-tooltip-card brand-kpi-tooltip__panel">
      <p class="brand-kpi-tooltip__text">{{ text }}</p>
    </v-card>
  </v-tooltip>
</template>
