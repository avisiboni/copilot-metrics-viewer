<template>
  <v-row class="brand-skeleton-filters mb-4" aria-hidden="true">
    <v-col v-for="n in fields" :key="n" cols="12" :md="fieldCols">
      <v-skeleton-loader type="text" width="32%" class="mb-2" />
      <v-skeleton-loader type="image" height="40" class="brand-skeleton-filters__input" />
    </v-col>
    <v-col v-if="showAction" cols="12" :md="fieldCols" class="d-flex align-center">
      <v-skeleton-loader type="button" width="140" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BrandFilterBarSkeleton',
  props: {
    fields: { type: Number, default: 3 },
    fieldCols: { type: Number, default: 4 },
    showAction: { type: Boolean, default: true }
  }
})
</script>
