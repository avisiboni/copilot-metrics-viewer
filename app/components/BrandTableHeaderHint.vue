<template>
  <span class="d-inline-flex align-center ga-1 flex-wrap brand-table-header-hint">
    <span>{{ label }}</span>
    <v-tooltip v-if="tooltip" :text="tooltip" location="top" max-width="360">
      <template #activator="{ props: tipProps }">
        <v-icon
          v-bind="tipProps"
          icon="mdi-information-outline"
          size="small"
          class="brand-table-header-hint__icon"
          :aria-label="tooltip"
        />
      </template>
    </v-tooltip>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BrandTableHeaderHint',
  props: {
    label: { type: String, required: true },
    tooltip: { type: String, default: '' }
  }
})
</script>
