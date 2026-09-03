<template>
  <div class="tiles-container brand-skeleton-tiles" aria-hidden="true" :aria-label="resolvedAriaLabel">
    <BrandKpiTileSkeleton v-for="n in count" :key="n" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import BrandKpiTileSkeleton from '@/components/BrandKpiTileSkeleton.vue'

export default defineComponent({
  name: 'BrandKpiTilesSkeleton',
  components: { BrandKpiTileSkeleton },
  props: {
    count: { type: Number, default: 4 },
    ariaLabel: { type: String, default: undefined }
  },
  setup(props) {
    const { t } = useAppI18n()
    const resolvedAriaLabel = computed(() => props.ariaLabel ?? t.value('skeleton.metrics'))
    return { resolvedAriaLabel }
  }
})
</script>
