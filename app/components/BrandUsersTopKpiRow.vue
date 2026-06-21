<script setup lang="ts">
import BrandKpiTooltip from '@/components/BrandKpiTooltip.vue'
import BrandUserAvatar from '@/components/BrandUserAvatar.vue'
import BrandUsagePatternChip from '@/components/BrandUsagePatternChip.vue'
import type { UserUsageRecord } from '../../shared/types/copilot-usage'
import type { UserUsageInsight } from '../../shared/types/usage-pattern'
import type { UserEngagementRankEntry } from '../../shared/utils/users-top-kpi'
import { topUserKpiCardClass } from '../../shared/utils/users-top-kpi'

const props = defineProps<{
  entries: UserEngagementRankEntry<UserUsageRecord>[]
  getInsight: (login: string) => UserUsageInsight | undefined
}>()

const emit = defineEmits<{
  select: [user: UserUsageRecord]
}>()

const { t } = useAppI18n()

const formatNum = (n: number) => n.toLocaleString()

const activityHint = (entry: UserEngagementRankEntry<UserUsageRecord>) =>
  t.value('users.topUserActivityHint', {
    interactions: formatNum(entry.interactions),
    generations: formatNum(entry.generations),
    acceptances: formatNum(entry.acceptances)
  })
</script>

<template>
  <section
    v-if="entries.length"
    class="brand-users-top-kpi mb-4"
    :aria-label="t('users.topUsersTitle')"
  >
    <div class="d-flex align-center flex-wrap ga-2 mb-2">
      <h3 class="text-h6 mb-0">{{ t('users.topUsersTitle') }}</h3>
      <BrandKpiTooltip :text="t('users.topUsersTooltip')" />
    </div>
    <div class="tiles-container brand-users-top-kpi__tiles">
      <v-card
        v-for="(entry, index) in entries"
        :key="entry.login"
        variant="flat"
        :ripple="false"
        :class="[
          'brand-kpi-card',
          'brand-metric-kpi',
          'brand-kpi-card--interactive',
          topUserKpiCardClass(index)
        ]"
        role="button"
        tabindex="0"
        :aria-label="t('users.topUserOpenDetail', { user: entry.login, rank: index + 1 })"
        @click="emit('select', entry.user)"
        @keydown.enter.prevent="emit('select', entry.user)"
        @keydown.space.prevent="emit('select', entry.user)"
      >
        <BrandKpiTooltip :text="t('users.topUserCardTooltip', { rank: index + 1 })" />
        <v-card-item class="tiles-text py-3">
          <div class="brand-users-top-kpi__rank text-caption mb-1">
            {{ t('users.topUserRank', { rank: index + 1 }) }}
          </div>
          <BrandUserAvatar
            :seed="entry.login"
            :display-name="entry.user.name ?? undefined"
            :size="40"
            class="mb-2"
          />
          <div class="brand-kpi-card__label text-truncate w-100" :title="entry.login">
            {{ entry.login }}
          </div>
          <div class="brand-kpi-card__hint mb-1">
            {{ t('users.topUserQualityLabel') }}
          </div>
          <div class="brand-kpi-card__value text-h4 mb-2">
            {{ entry.engagementScore }}
          </div>
          <div class="brand-kpi-card__hint text-caption mb-2">
            {{ activityHint(entry) }}
          </div>
          <BrandUsagePatternChip
            v-if="getInsight(entry.login)"
            :insight="getInsight(entry.login)"
            class="brand-users-top-kpi__chip"
          />
        </v-card-item>
      </v-card>
    </div>
  </section>
</template>

<style scoped>
.brand-users-top-kpi__tiles > .brand-kpi-card {
  flex: 1 1 200px;
  max-width: 280px;
  min-width: 200px;
}

.brand-users-top-kpi__rank {
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.85;
}

.brand-users-top-kpi__chip {
  max-width: 100%;
}
</style>
