<script lang="ts" setup>
import type { ComponentClass, ComponentLabel } from '../../types/shared'
import { shallowRef, watch } from 'vue'
import { useFocusTrap } from '../../composables/use-focus-trap'
import { useModelValue } from '../../composables/use-model-value'
import POverlay from '../overlay/index.vue'
import PScrollable from '../scrollable/index.vue'

interface Props {
  title?: ComponentLabel
  subtitle?: ComponentLabel
  width?: number | string
  loading?: boolean
  modelValue?: boolean
  appendToBody?: boolean
  headerStylize?: boolean
  footerStylize?: boolean
  modalClass?: ComponentClass
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
    appendToBody: true,
    footerStylize: true,
    headerStylize: false,
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

  if (!props.closeOnClickOverlay || props.loading) {
    return
  }

  isVisible.value = false
}

function onUpdateModelValue(visible: boolean) {
  if (!visible && props.loading) {
    return
  }

  isVisible.value = visible
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
  <POverlay
    :model-value="isVisible"
    :append-to-body="appendToBody"
    :close-on-press-escape="closeOnPressEscape"
    @update:model-value="onUpdateModelValue"
    @click="onOverlayClick"
  >
    <Transition name="pxd-transition--modal" mode="out-in" appear>
      <div
        v-if="isVisible"
        ref="modalRef"
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        class="pxd-modal left-0 bottom-0 translate-z-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:[--o:0] sm:[--t:scale(0.98)] sm:w-[calc(var(--w,540)*1px)] fixed z-10 flex h-max w-full max-w-full flex-col overflow-hidden rounded-t-lg bg-background-100 shadow-border-modal outline-none motion-safe:transition-all dark:bg-background-200"
        :class="modalClass"
        :style="{ '--w': width }"
      >
        <header
          class="pxd-modal--header p-6 sm:pb-4 relative shrink-0 empty:py-3"
          :class="{ 'sm:pt-4 border-b bg-background-200 dark:bg-background-100': headerStylize }"
        >
          <h3 v-if="$slots.title || title" class="text-xl font-semibold tracking-tight m-0">
            <slot name="title">
              {{ title }}
            </slot>
          </h3>

          <div v-if="$slots.subtitle || subtitle" class="mt-3 text-sm text-muted-foreground">
            <slot name="subtitle">
              {{ subtitle }}
            </slot>
          </div>
        </header>

        <PScrollable
          v-if="$slots.default"
          :data-header="headerStylize"
          class="pxd-modal--content group flex-1"
          content-class="group-data-[header=true]:pt-5 px-6 pb-5"
        >
          <slot />
        </PScrollable>

        <footer
          v-if="$slots.footer"
          class="pxd-modal--footer p-4 gap-2 relative flex shrink-0 items-center justify-between"
          :class="{ 'border-t bg-background-200 dark:bg-background-100': footerStylize }"
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
