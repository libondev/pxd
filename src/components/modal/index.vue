<script lang="ts" setup>
import { computed } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import { getCssUnitValue } from '../../utils/format'
import POverlay from '../overlay/index.vue'
import PTeleport from '../teleport/index.vue'

interface Props {
  title?: string
  width?: number | string
  modelValue?: boolean
  appendToBody?: boolean
  closeOnClickModal?: boolean
}

defineOptions({
  name: 'PModal',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    width: 540,
    modelValue: false,
    appendToBody: true,
    closeOnClickModal: true,
  },
)

const emits = defineEmits<{
  'open': []
  'close': []
  'update:modelValue': [boolean]
}>()

const isVisible = useModelValue(props, emits)

const modalWidth = computed(() => getCssUnitValue(props.width))

function onOverlayClick() {
  if (!props.closeOnClickModal) {
    return
  }

  isVisible.value = false
  emits('close')
}
</script>

<template>
  <div tabindex="-1">
    <POverlay v-model="isVisible" :append-to-body="appendToBody" @click="onOverlayClick" />

    <PTeleport v-if="isVisible" :disabled="!appendToBody">
      <div
        class="pxd-modal fixed inset-0 z-10 shadow-border-modal rounded-xl bg-background top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 motion-safe:transition-all"
        :style="{ width: modalWidth }"
      >
        <header class="pxd-modal--header py-5 px-6 text-2xl font-[600]">
          <slot name="title">
            {{ title }}
          </slot>
        </header>

        <div class="pxd-modal--content pb-5 px-6">
          <slot />
        </div>

        <footer class="pxd-modal--footer p-4 empty:hidden">
          <slot name="footer" />
        </footer>
      </div>
    </PTeleport>
  </div>
</template>

<style>
@keyframes modal-in {
  from {
    transform: scale(0.98);
    opacity: .8;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .pxd-modal {
    animation: modal-in var(--default-transition-duration) var(--default-transition-timing-function);
  }
}
</style>
