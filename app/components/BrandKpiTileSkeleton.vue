<template>
  <v-card variant="flat" class="brand-kpi-card brand-skeleton-kpi" aria-hidden="true">
    <v-card-item>
      <v-skeleton-loader type="text" width="72%" class="brand-skeleton-kpi__line" />
      <v-skeleton-loader type="text" width="48%" class="brand-skeleton-kpi__line brand-skeleton-kpi__line--sm" />
      <v-skeleton-loader type="heading" width="40%" class="brand-skeleton-kpi__value" />
    </v-card-item>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BrandKpiTileSkeleton'
})
</script>
