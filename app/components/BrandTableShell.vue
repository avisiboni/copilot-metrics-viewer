<template>
  <div class="brand-table-shell">
    <div v-if="title || subtitle || $slots.toolbar" class="brand-table-shell__header">
      <div class="brand-table-shell__title-wrap">
        <h3 v-if="title" class="brand-table-shell__title">{{ title }}</h3>
        <p v-if="subtitle" class="brand-table-shell__subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.toolbar" class="brand-table-shell__toolbar">
        <slot name="toolbar" />
      </div>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BrandTableShell',
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' }
  }
})
</script>
