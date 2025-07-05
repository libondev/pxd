<script lang="ts" setup>
import type { ComponentLabel } from '../../types/components'
import { nextTick, shallowRef, watch } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import POverlay from '../overlay/index.vue'
import PScrollable from '../scrollable/index.vue'

interface Props {
  title?: ComponentLabel
  subtitle?: ComponentLabel
  width?: number | string
  modelValue?: boolean
  headerStyle?: boolean
  footerStyle?: boolean
  appendToBody?: boolean
  closeOnClickModal?: boolean
}

defineOptions({
  name: 'PModal',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: false,
    headerStyle: false,
    footerStyle: true,
    appendToBody: true,
    closeOnClickModal: false,
  },
)

const emits = defineEmits<{
  'open': []
  'close': []
  'click-outside': [MouseEvent]
  'update:modelValue': [boolean]
}>()

const modalRef = shallowRef<HTMLElement>()
const isVisible = useModelValue(props, emits)

function onOverlayClick(ev: MouseEvent) {
  emits('click-outside', ev)

  if (!props.closeOnClickModal) {
    return
  }

  isVisible.value = false
}

watch(() => isVisible.value, (visible) => {
  nextTick(() => {
    if (visible) {
      emits('open')
      return
    }

    emits('close')
  })
}, { flush: 'post' })
</script>

<template>
  <POverlay v-model="isVisible" :append-to-body="appendToBody" @click="onOverlayClick">
    <Transition name="pxd-transition--modal" mode="out-in">
      <div
        v-if="isVisible"
        ref="modalRef"
        class="pxd-modal fixed z-10 flex flex-col h-max overflow-hidden shadow-border-modal rounded-tl-lg rounded-tr-lg sm:rounded-xl bg-background dark:bg-background-secondary w-full max-w-full left-0 bottom-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 motion-safe:transition-all"
        :style="{ '--width': width }"
      >
        <header
          class="pxd-modal--header relative shrink-0 py-5 px-6 -mb-6"
          :class="{ 'mb-0 border-b bg-background-secondary dark:bg-background': headerStyle }"
        >
          <h3 class="text-2xl font-semibold">
            <slot name="title">
              {{ title }}
            </slot>
          </h3>

          <div v-if="subtitle" class="mt-4">
            <slot name="subtitle">
              {{ subtitle }}
            </slot>
          </div>
        </header>

        <PScrollable
          class="pxd-modal--content flex-1"
          content-class="p-6"
        >
          <slot />
        </PScrollable>

        <footer
          class="pxd-modal--footer relative p-4 shrink-0 flex items-center justify-between"
          :class="{ 'border-t bg-background-secondary dark:bg-background': footerStyle }"
        >
          <slot name="footer" />
        </footer>
      </div>
    </Transition>
  </POverlay>
</template>

<style>
.pxd-transition--modal-enter-active,
.pxd-transition--modal-leave-active {
  transition-timing-function: cubic-bezier(0.175,0.885,0.32,1.1);
  transition:
    transform var(--default-transition-duration),
    opacity var(--default-transition-duration);
}

.pxd-transition--modal-enter-from,
.pxd-transition--modal-leave-to {
  transform: translate(0, 100%);
}

@media (width >= 40rem) {
  .pxd-transition--modal-enter-from,
  .pxd-transition--modal-leave-to {
    opacity: 0;
    transform: scale(0.98) !important;
  }

  .pxd-modal {
    width: calc(var(--width, 540) * 1px);
  }
}

.pxd-modal {
  max-height: min(800px, 80vh);
}
</style>
