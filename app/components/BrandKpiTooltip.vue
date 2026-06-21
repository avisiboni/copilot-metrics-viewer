<script setup lang="ts">
const { t } = useAppI18n()

defineProps<{
  text: string
}>()
</script>

<template>
  <BrandTooltip v-if="text" :text="text" location="bottom end">
    <template #activator="{ props: tipProps }">
      <button
        type="button"
        class="brand-kpi-tooltip"
        v-bind="tipProps"
        :aria-label="t('common.aboutKpi')"
        @click.stop
      >
        <v-icon icon="mdi-information-outline" size="18" />
      </button>
    </template>
  </BrandTooltip>
</template>
