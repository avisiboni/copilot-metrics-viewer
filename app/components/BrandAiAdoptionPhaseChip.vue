<template>
  <span
    v-if="phase != null && ideOnly && isAgentAdoptionPhase(phase)"
    class="text-medium-emphasis"
    :title="t('adoption.agentPhaseHiddenHint')"
  >
    {{ t('adoption.agentPhaseHidden') }}
  </span>
  <BrandTooltip
    v-else-if="phase != null"
    :text="hint"
    location="top"
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
  </BrandTooltip>
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
      default: undefined,
    },
    phaseId: {
      type: Number as () => AiAdoptionPhaseId | undefined,
      default: undefined,
    },
  },
  setup(props) {
    const { t } = useAppI18n()
    const { ideOnly, isAgentAdoptionPhase } = useAdoptionIdeOnly()

    const resolvedPhase = computed(() => props.phase?.phase ?? props.phaseId)

    const label = computed(() => {
      const id = resolvedPhase.value
      if (id === undefined) return t.value('adoption.phaseUnknown')
      return t.value(`adoption.phase${id}Title` as 'adoption.phase0Title')
    })

    const hint = computed(() => {
      const id = resolvedPhase.value
      if (id === undefined) return t.value('adoption.phaseUnknown')
      if (ideOnly.value && id === 1) {
        return t.value('adoption.phase1HintIdeOnly')
      }
      return t.value(`adoption.phase${id}Hint` as 'adoption.phase0Hint')
    })

    const chipColor = computed(() => {
      const id = resolvedPhase.value
      return id !== undefined ? phaseChipColor(id) : 'default'
    })

    return {
      t,
      ideOnly,
      isAgentAdoptionPhase,
      label,
      hint,
      chipColor,
      phase: resolvedPhase,
    }
  },
})
</script>
