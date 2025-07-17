<script lang="ts" setup>
import type { ComponentLabel } from '../../types/components'
import { shallowRef, watch } from 'vue'
import { useFocusTrap } from '../../composables/useFocusTrap'
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
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
}

defineOptions({
  name: 'PModal',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: false,
    headerStyle: false,
    footerStyle: true,
    appendToBody: true,
    closeOnPressEscape: false,
    closeOnClickOverlay: false,
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

useFocusTrap(modalRef)

function onOverlayClick(ev: MouseEvent) {
  emits('click-outside', ev)

  if (!props.closeOnClickOverlay) {
    return
  }

  isVisible.value = false
}

function onModalKeydown() {
  if (!props.closeOnPressEscape) {
    return
  }

  isVisible.value = false
}

watch(() => isVisible.value, (visible) => {
  if (visible) {
    emits('open')
    return
  }

  emits('close')
})
</script>

<template>
  <POverlay v-model="isVisible" :append-to-body="appendToBody" @click="onOverlayClick">
    <Transition name="pxd-transition--modal" mode="out-in">
      <div
        v-if="isVisible"
        ref="modalRef"
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        class="pxd-modal fixed z-10 flex flex-col h-max overflow-hidden shadow-border-modal rounded-tl-lg rounded-tr-lg bg-background dark:bg-background-secondary w-full max-w-full left-0 bottom-0 outline-none translate-z-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 motion-safe:transition-all sm:rounded-xl sm:[--o:0] sm:[--t:scale(0.98)] sm:w-[calc(var(--w,540)*1px)]"
        :style="{ '--w': width }"
        @keydown.esc="onModalKeydown"
      >
        <header
          class="pxd-modal--header relative shrink-0 px-6 py-4 sm:py-6"
          :class="{ 'border-b bg-background-secondary dark:bg-background': headerStyle }"
        >
          <h3 class="text-base sm:text-2xl font-semibold tracking-tight">
            <slot name="title">
              {{ title }}
            </slot>
          </h3>

          <div v-if="subtitle" class="mt-4 text-sm text-muted-foreground">
            <slot name="subtitle">
              {{ subtitle }}
            </slot>
          </div>
        </header>

        <PScrollable
          :data-header="headerStyle"
          class="pxd-modal--content group flex-1"
          content-class="group-data-[header=true]:pt-6 px-6 pb-6"
        >
          <slot />
        </PScrollable>

        <footer
          class="pxd-modal--footer relative p-4 shrink-0 flex items-center gap-2 justify-between"
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
  transition-timing-function: var(--default-transition-timing-function);
  transition:
    transform var(--default-transition-duration),
    opacity var(--default-transition-duration);
}

.pxd-modal.pxd-transition--modal-enter-from,
.pxd-modal.pxd-transition--modal-leave-to {
  opacity: var(--o, 1);
  transform: var(--t, translate(0, 100%));
}

.pxd-modal {
  max-height: min(800px, 80vh);
}
</style>
