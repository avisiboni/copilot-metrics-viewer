<template>
  <div
    class="brand-table-shell brand-skeleton-table"
    aria-hidden="true"
    :aria-label="resolvedAriaLabel"
    :style="{ '--skeleton-cols': String(columns) }"
  >
    <div v-if="showHeader" class="brand-table-shell__header">
      <div class="brand-table-shell__title-wrap">
        <v-skeleton-loader type="heading" width="28%" class="brand-skeleton-table__title" />
        <v-skeleton-loader v-if="showSubtitle" type="text" width="52%" class="brand-skeleton-table__subtitle" />
      </div>
      <v-skeleton-loader v-if="showToolbar" type="button" width="220" class="brand-skeleton-table__toolbar" />
    </div>
    <div class="brand-skeleton-table__head">
      <v-skeleton-loader
        v-for="col in columns"
        :key="`h-${col}`"
        type="text"
        class="brand-skeleton-table__cell"
      />
    </div>
    <div
      v-for="row in rows"
      :key="`r-${row}`"
      class="brand-skeleton-table__row"
    >
      <v-skeleton-loader
        v-for="col in columns"
        :key="`c-${row}-${col}`"
        type="text"
        class="brand-skeleton-table__cell"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'BrandTableSkeleton',
  props: {
    rows: { type: Number, default: 8 },
    columns: { type: Number, default: 6 },
    showHeader: { type: Boolean, default: true },
    showSubtitle: { type: Boolean, default: true },
    showToolbar: { type: Boolean, default: false },
    ariaLabel: { type: String, default: undefined }
  },
  setup(props) {
    const { t } = useAppI18n()
    const resolvedAriaLabel = computed(() => props.ariaLabel ?? t.value('skeleton.table'))
    return { resolvedAriaLabel }
  }
})
</script>
