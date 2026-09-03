<template>
  <div class="brand-skeleton-chart-block" aria-hidden="true">
    <v-skeleton-loader v-if="showTitle" type="heading" :width="titleWidth" class="brand-skeleton-chart-block__title" />
    <div class="brand-skeleton-chart-block__chart" :style="{ height: `${height}px` }">
      <v-skeleton-loader type="image" class="brand-skeleton-chart-block__fill" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BrandChartSkeleton',
  props: {
    height: { type: Number, default: 280 },
    showTitle: { type: Boolean, default: true },
    titleWidth: { type: String, default: '42%' }
  }
})
</script>
