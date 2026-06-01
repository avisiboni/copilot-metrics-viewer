<script setup lang="ts">
const { t } = useAppI18n()

defineProps<{
  text: string
}>()
</script>

<template>
  <v-tooltip
    v-if="text"
    location="bottom end"
    open-on-hover
    open-delay="200"
    close-delay="200"
  >
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
    <v-card class="pa-3 brand-tooltip-card brand-kpi-tooltip__panel">
      <p class="brand-kpi-tooltip__text">{{ text }}</p>
    </v-card>
  </v-tooltip>
</template>
