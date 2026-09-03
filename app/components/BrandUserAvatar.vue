<template>
  <div
    class="brand-user-avatar"
    :style="avatarStyle"
    :title="seed"
    role="img"
    :aria-label="ariaLabel || seed"
  >
    {{ initialsText }}
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { avatarColorsFromSeed, userInitials } from '../../shared/utils/user-avatar'

export default defineComponent({
  name: 'BrandUserAvatar',
  props: {
    seed: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      default: undefined,
    },
    size: {
      type: Number,
      default: 36,
    },
    ariaLabel: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const initialsText = computed(() => userInitials(props.seed, props.displayName))
    const avatarStyle = computed(() => {
      const { bg, fg } = avatarColorsFromSeed(props.seed)
      const px = `${props.size}px`
      return {
        width: px,
        height: px,
        minWidth: px,
        minHeight: px,
        backgroundColor: bg,
        color: fg,
        fontSize: `${Math.max(10, Math.round(props.size * 0.34))}px`,
      }
    })
    return { initialsText, avatarStyle }
  },
})
</script>
