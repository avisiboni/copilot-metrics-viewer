<template>
  <v-tooltip
    v-if="phase != null"
    location="top"
    open-on-hover
    open-delay="200"
    close-delay="200"
  >
    <template #activator="{ props: tooltipProps }">
      <v-chip
        v-bind="tooltipProps"
        size="small"
        variant="flat"
        :color="chipColor"
        class="brand-adoption-phase-chip"
        label
      >
        {{ label }}
      </v-chip>
    </template>
    <v-card class="pa-3 brand-tooltip-card brand-kpi-tooltip__panel">
      <p class="brand-kpi-tooltip__text">{{ hint }}</p>
    </v-card>
  </v-tooltip>
  <span v-else class="text-medium-emphasis">{{ t('adoption.phaseUnknown') }}</span>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import type { AiAdoptionPhase, AiAdoptionPhaseId } from '../../shared/types/copilot-usage'
import { phaseChipColor } from '../../shared/utils/ai-adoption-phase'

export default defineComponent({
  name: 'BrandAiAdoptionPhaseChip',
  props: {
    phase: {
      type: Object as () => AiAdoptionPhase | undefined,
      default: undefined
    },
    phaseId: {
      type: Number as () => AiAdoptionPhaseId | undefined,
      default: undefined
    }
  },
  setup(props) {
    const { t } = useAppI18n()

    const resolvedPhase = computed(
      () => props.phase?.phase ?? props.phaseId
    )

    const label = computed(() => {
      const id = resolvedPhase.value
      if (id === undefined) return t.value('adoption.phaseUnknown')
      return t.value(`adoption.phase${id}Title` as 'adoption.phase0Title')
    })

    const hint = computed(() => {
      const id = resolvedPhase.value
      if (id === undefined) return t.value('adoption.phaseUnknown')
      return t.value(`adoption.phase${id}Hint` as 'adoption.phase0Hint')
    })

    const chipColor = computed(() => {
      const id = resolvedPhase.value
      return id !== undefined ? phaseChipColor(id) : 'default'
    })

    return { t, label, hint, chipColor, phase: resolvedPhase }
  }
})
</script>
