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
    buttonClass: 'brand-chart-title__info',
  }
)
</script>

<template>
  <BrandTooltip v-if="text" :text="text" :location="location">
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
  </BrandTooltip>
</template>
