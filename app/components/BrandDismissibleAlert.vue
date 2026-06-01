<template>
  <Transition name="brand-dismissible-alert">
    <div
      v-if="visible"
      class="brand-dismissible-alert"
      :class="wrapperClass"
    >
      <v-alert
        :type="type"
        :variant="variant"
        :density="density"
        class="brand-dismissible-alert__alert"
        :class="alertClass"
      >
        <div class="brand-dismissible-alert__content">
          <v-alert-title v-if="title">
            {{ title }}
          </v-alert-title>
          <slot />
        </div>
        <template #append>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="x-small"
            density="comfortable"
            class="brand-dismissible-alert__close"
            :aria-label="closeLabel"
            @click="dismiss"
          />
        </template>
      </v-alert>
    </div>
  </Transition>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

const STORAGE_PREFIX = 'brand-dismissible-alert:'

export default defineComponent({
  name: 'BrandDismissibleAlert',
  props: {
    type: {
      type: String as () => 'info' | 'warning' | 'error' | 'success',
      default: 'info'
    },
    variant: {
      type: String,
      default: 'tonal'
    },
    density: {
      type: String,
      default: 'compact'
    },
    alertClass: {
      type: String,
      default: 'brand-alert brand-alert--info'
    },
    wrapperClass: {
      type: String,
      default: 'mb-3'
    },
    /** When set, dismissal is remembered for this browser session. */
    storageKey: {
      type: String,
      default: ''
    },
    closeLabel: {
      type: String,
      default: 'Close'
    },
    title: {
      type: String,
      default: ''
    }
  },
  emits: ['dismiss'],
  setup(props, { emit }) {
    const visible = ref(true)

    onMounted(() => {
      if (!props.storageKey || typeof sessionStorage === 'undefined') {
        return
      }
      if (sessionStorage.getItem(STORAGE_PREFIX + props.storageKey) === '1') {
        visible.value = false
      }
    })

    function dismiss() {
      if (!visible.value) {
        return
      }
      visible.value = false
      if (props.storageKey && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_PREFIX + props.storageKey, '1')
      }
      emit('dismiss')
    }

    return { visible, dismiss }
  }
})
</script>

<style scoped>
.brand-dismissible-alert__alert {
  position: relative;
}

.brand-dismissible-alert__content {
  flex: 1;
  min-width: 0;
  padding-inline-end: 4px;
}

.brand-dismissible-alert__close {
  align-self: flex-start;
  margin-top: 2px;
  color: var(--brand-primary-dark) !important;
  opacity: 0.72;
  transition: opacity 0.15s ease, background-color 0.15s ease;
}

.brand-dismissible-alert__alert :deep(.v-alert__append) {
  align-self: flex-start;
  margin-inline-start: 8px;
}

.brand-dismissible-alert__close:hover {
  opacity: 1;
  background-color: color-mix(in srgb, var(--brand-primary) 12%, transparent) !important;
}

.brand-dismissible-alert-enter-active,
.brand-dismissible-alert-leave-active {
  overflow: hidden;
  transition:
    opacity 0.28s ease,
    transform 0.28s ease,
    max-height 0.32s ease,
    margin-bottom 0.32s ease;
}

.brand-dismissible-alert-enter-from,
.brand-dismissible-alert-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0 !important;
  margin-bottom: 0 !important;
}

.brand-dismissible-alert-enter-to,
.brand-dismissible-alert-leave-from {
  max-height: 320px;
}
</style>
