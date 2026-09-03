<template>
  <div class="brand-page-skeleton" role="status" aria-live="polite" :aria-label="resolvedAriaLabel">
    <!-- Metrics / org / enterprise / team scope -->
    <template v-if="layout === 'metrics'">
      <BrandKpiTilesSkeleton :count="4" />
      <section class="brand-page-panel">
        <BrandChartSkeleton v-for="n in 6" :key="`m-chart-${n}`" :height="280" />
      </section>
    </template>

    <!-- Languages / editors -->
    <template v-else-if="layout === 'breakdown'">
      <BrandKpiTilesSkeleton :count="1" />
      <section class="brand-page-panel">
        <v-row class="mb-4">
          <v-col v-for="n in 3" :key="`pie-${n}`" cols="12" md="4">
            <v-card variant="flat" class="brand-skeleton-pie-card" aria-hidden="true">
              <v-card-item>
                <v-skeleton-loader type="heading" width="80%" class="mb-4" />
                <v-skeleton-loader type="avatar" class="brand-skeleton-pie-card__chart" />
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
        <BrandTableSkeleton :columns="7" :rows="10" show-toolbar />
      </section>
    </template>

    <!-- Copilot chat -->
    <template v-else-if="layout === 'chat'">
      <BrandKpiTilesSkeleton :count="2" />
      <section class="brand-page-panel">
        <BrandChartSkeleton v-for="n in 3" :key="`chat-chart-${n}`" />
      </section>
    </template>

    <!-- Usage insights (agent mode) -->
    <template v-else-if="layout === 'agent-mode'">
      <section class="brand-page-panel github-com-container">
        <v-skeleton-loader type="heading" width="36%" class="mb-4" />
        <v-row class="mb-4">
          <v-col v-for="n in 4" :key="`agent-kpi-${n}`" cols="12" md="6" lg="3">
            <BrandKpiTileSkeleton />
          </v-col>
        </v-row>
        <BrandChartSkeleton v-for="n in 5" :key="`agent-chart-${n}`" />
        <v-skeleton-loader type="heading" width="32%" class="mt-6 mb-4" />
        <div v-for="n in 2" :key="`agent-panel-${n}`" class="brand-skeleton-expansion mb-2">
          <v-skeleton-loader type="list-item-two-line" />
        </div>
      </section>
    </template>

    <!-- Users tab -->
    <template v-else-if="layout === 'users'">
      <section class="brand-page-panel">
        <v-skeleton-loader type="heading" width="40%" class="mb-4" />
        <v-card flat class="pa-3 mb-3 brand-skeleton-banner">
          <v-skeleton-loader type="list-item-two-line" />
        </v-card>
        <BrandKpiTilesSkeleton :count="5" class="mb-4" />
        <BrandFilterBarSkeleton />
        <BrandTableSkeleton :columns="8" :rows="12" show-toolbar />
      </section>
    </template>

    <!-- Usage & billing -->
    <template v-else-if="layout === 'billing'">
      <section class="brand-page-panel">
        <v-skeleton-loader type="heading" width="44%" class="mb-2" />
        <v-skeleton-loader type="paragraph" width="72%" class="mb-4" />
        <BrandFilterBarSkeleton :fields="1" :field-cols="6" :show-action="false" />
        <v-row class="mb-4">
          <v-col v-for="n in 6" :key="`bill-kpi-${n}`" cols="6" sm="4" md="3" lg="2">
            <BrandKpiTileSkeleton />
          </v-col>
        </v-row>
        <v-row class="mb-4">
          <v-col v-for="n in 3" :key="`bill-kpi2-${n}`" cols="12" md="4">
            <BrandKpiTileSkeleton />
          </v-col>
        </v-row>
        <v-row class="mb-4">
          <v-col cols="12" lg="7">
            <v-card>
              <v-card-title><v-skeleton-loader type="text" width="50%" /></v-card-title>
              <v-card-text>
                <BrandChartSkeleton :show-title="false" :height="320" />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" lg="5">
            <v-card>
              <v-card-title><v-skeleton-loader type="text" width="50%" /></v-card-title>
              <v-card-text>
                <BrandChartSkeleton :show-title="false" :height="320" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <BrandTableSkeleton :columns="7" :rows="10" />
      </section>
    </template>

    <!-- Seat analysis -->
    <template v-else-if="layout === 'seats'">
      <BrandKpiTilesSkeleton :count="4" :aria-label="t('skeleton.seats')" />
      <v-card flat class="pa-3 mb-2 brand-skeleton-banner">
        <v-skeleton-loader type="list-item-three-line" />
      </v-card>
      <section class="brand-page-panel">
        <BrandTableSkeleton :columns="7" :rows="10" show-toolbar />
      </section>
    </template>

    <!-- Teams comparison -->
    <template v-else-if="layout === 'teams'">
      <v-card class="mb-4 brand-skeleton-teams-card">
        <v-card-title><v-skeleton-loader type="heading" width="36%" /></v-card-title>
        <v-card-subtitle><v-skeleton-loader type="text" width="55%" /></v-card-subtitle>
        <v-card-text>
          <v-skeleton-loader type="image" height="56" class="mb-2" />
          <v-skeleton-loader type="text" width="70%" />
        </v-card-text>
      </v-card>
    </template>

    <!-- API response -->
    <template v-else-if="layout === 'api'">
      <div class="brand-skeleton-api-toolbar mb-4">
        <v-skeleton-loader v-for="n in 5" :key="`api-btn-${n}`" type="button" width="120" class="mr-2" />
      </div>
      <v-card class="brand-skeleton-code-block mb-4">
        <v-skeleton-loader type="paragraph" />
        <v-skeleton-loader type="sentences" />
        <v-skeleton-loader type="sentences" />
      </v-card>
      <v-skeleton-loader type="button" width="200" class="mb-4" />
      <v-card class="brand-skeleton-code-block">
        <v-skeleton-loader type="paragraph" />
        <v-skeleton-loader type="sentences" />
      </v-card>
    </template>

    <!-- Minimal fallback -->
    <template v-else>
      <BrandKpiTilesSkeleton :count="2" />
      <section class="brand-page-panel">
        <BrandChartSkeleton />
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'
import type { BrandPageSkeletonLayout } from '@/utils/tab-skeleton-layout'
import BrandKpiTileSkeleton from '@/components/BrandKpiTileSkeleton.vue'
import BrandKpiTilesSkeleton from '@/components/BrandKpiTilesSkeleton.vue'
import BrandChartSkeleton from '@/components/BrandChartSkeleton.vue'
import BrandTableSkeleton from '@/components/BrandTableSkeleton.vue'
import BrandFilterBarSkeleton from '@/components/BrandFilterBarSkeleton.vue'

export default defineComponent({
  name: 'BrandPageSkeleton',
  components: {
    BrandKpiTileSkeleton,
    BrandKpiTilesSkeleton,
    BrandChartSkeleton,
    BrandTableSkeleton,
    BrandFilterBarSkeleton
  },
  props: {
    layout: {
      type: String as PropType<BrandPageSkeletonLayout>,
      default: 'metrics'
    },
    ariaLabel: { type: String, default: undefined }
  },
  setup(props) {
    const { t } = useAppI18n()
    const resolvedAriaLabel = computed(() => props.ariaLabel ?? t.value('skeleton.page'))
    return { t, resolvedAriaLabel }
  }
})
</script>
