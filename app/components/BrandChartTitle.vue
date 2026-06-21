<script setup lang="ts">
const { t } = useAppI18n()

withDefaults(
  defineProps<{
    title: string
    tooltip?: string
    headingTag?: 'h2' | 'h3' | 'div' | 'span'
    headingClass?: string
    wrapperClass?: string
  }>(),
  {
    headingTag: 'h2',
    headingClass: 'mb-1',
    wrapperClass: '',
  }
)
</script>

<template>
  <div class="brand-chart-title" :class="wrapperClass">
    <component :is="headingTag" class="brand-chart-title__heading" :class="headingClass">
      {{ title }}
    </component>
    <BrandTooltip
      v-if="tooltip"
      :text="tooltip"
      location="bottom start"
    >
      <template #activator="{ props: tipProps }">
        <button
          type="button"
          class="brand-chart-title__info"
          v-bind="tipProps"
          :aria-label="t('common.aboutChart', { title })"
        >
          <v-icon icon="mdi-information-outline" size="18" />
        </button>
      </template>
    </BrandTooltip>
  </div>
</template>
