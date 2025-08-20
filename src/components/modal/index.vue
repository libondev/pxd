<script lang="ts" setup>
import type { ComponentClass, ComponentLabel } from '../../types/shared'
import { shallowRef, watch } from 'vue'
import { useFocusTrap } from '../../composables/use-focus-trap'
import { useModelValue } from '../../composables/use-model-value'
import { getCssUnitValue, isTruthyProp } from '../../utils/format'
import POverlay from '../overlay/index.vue'

interface Props {
  title?: ComponentLabel
  subtitle?: ComponentLabel
  width?: string | number
  loading?: boolean
  modelValue?: boolean
  appendToBody?: boolean
  headerStylize?: boolean
  footerStylize?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
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

  if (!isTruthyProp(props.closeOnClickOverlay) || isTruthyProp(props.loading)) {
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
        class="pxd-modal left-0 bottom-0 translate-z-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:[--o:0] sm:[--t:scale(0.98)] sm:w-[var(--w,540px)] fixed z-10 flex h-max w-full max-w-full flex-col overflow-hidden rounded-t-lg bg-background-100 shadow-border-modal outline-none motion-safe:transition-all dark:bg-background-200"
        :class="wrapperClass"
        :style="{ '--w': getCssUnitValue(width) }"
      >
        <header
          class="pxd-modal--header px-6 py-4 relative shrink-0 empty:py-3"
          :class="{ 'sm:pt-4 border-b bg-background-200 dark:bg-background-100': headerStylize }"
        >
          <slot name="header">
            <h3 v-if="$slots.title || title" class="text-lg sm:text-xl font-semibold tracking-tight m-0">
              <slot name="title">
                {{ title }}
              </slot>
            </h3>

            <div v-if="$slots.subtitle || subtitle" class="mt-2 text-sm text-muted-foreground">
              <slot name="subtitle">
                {{ subtitle }}
              </slot>
            </div>
          </slot>
        </header>

        <div
          v-if="$slots.default"
          class="pxd-modal--content group px-6 pb-5 flex-1 overflow-auto"
          :class="[{ 'pt-5': headerStylize }, contentClass]"
        >
          <slot />
        </div>

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
