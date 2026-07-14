<script lang="ts" setup>
import type { ModalEmits, ModalProps } from './types'
import { computed, shallowRef, watch } from 'vue'
import { useFocusTrap } from '../../composables/use-focus-trap'
import { useModelValue } from '../../composables/use-model-value'
import { getCssUnitValue, isTruthyProp } from '../../utils/format'
import PLoadingMask from '../_internal/loading-mask.vue'
import POverlay from '../overlay/index.vue'

defineOptions({
  name: 'PModal',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<ModalProps>(), {
  modelValue: false,
  appendToBody: true,
  autoFocusElement: false,
  defaultFooterStyle: true,
  defaultHeaderStyle: false,
  closeOnPressEscape: false,
  closeOnClickOverlay: false,
})

const emits = defineEmits<ModalEmits>()

const modalRef = shallowRef<HTMLElement>()
const isVisible = useModelValue(props, emits)

const computedStyle = computed(() => {
  return {
    '--modal-index': props.zIndex,
    '--modal-width': getCssUnitValue(props.width),
  }
})

const defaultStyles = computed(() => ({
  headerClass: props.defaultHeaderStyle
    ? 'pb-4 sm:pb-6 border-b bg-background-200 dark:bg-background-100'
    : '',
  footerClass: props.defaultFooterStyle
    ? 'border-t pt-4 bg-background-200 dark:bg-background-100'
    : '',
}))

const focusTrapOptions = computed(() => ({
  autoFocusElement: props.autoFocusElement,
  escapeDeactivates: props.closeOnPressEscape,
  clickOutsideDeactivates: props.closeOnClickOverlay,
}))

useFocusTrap(modalRef, focusTrapOptions)

function closeOverlayIfNeed() {
  if (isTruthyProp(props.loading)) {
    return
  }

  isVisible.value = false
}

function onOverlayClick(ev: PointerEvent) {
  emits('outside-click', ev)

  if (!isTruthyProp(props.closeOnClickOverlay)) {
    return
  }

  closeOverlayIfNeed()
}

watch(
  () => isVisible.value,
  (visible) => {
    emits('visible-change', visible)

    if (visible) {
      emits('show')
      return
    }

    emits('hide')
  },
)
</script>

<template>
  <POverlay
    :model-value="isVisible"
    :append-to-body="appendToBody"
    :close-on-press-escape="closeOnPressEscape"
    @escape="closeOverlayIfNeed"
    @click="onOverlayClick"
  >
    <Transition name="pxd-transition--modal" mode="out-in" appear>
      <div
        v-if="isVisible"
        ref="modalRef"
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        :aria-expanded="isVisible"
        class="pxd-modal group/modal left-0 translate-z-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:[--o:0] sm:[--t:scale(0.98)] sm:w-(--modal-width) max-sm:bottom-0 pointer-events-auto fixed z-(--modal-index) flex w-full max-w-full flex-col overflow-hidden rounded-t-lg bg-background-100 shadow-border-modal outline-none motion-safe:transition-appearance dark:bg-background-200"
        :class="wrapperClass"
        :style="computedStyle"
        v-bind="$attrs"
      >
        <header
          class="pxd-modal--header px-6 pt-4 sm:pt-6 empty:py-3 relative shrink-0"
          :class="defaultStyles.headerClass"
        >
          <slot name="header">
            <h3
              v-if="$slots.title || title"
              class="text-lg sm:text-xl font-semibold tracking-tight m-0"
            >
              <slot name="title">
                {{ title }}
              </slot>
            </h3>

            <div v-if="$slots.subtitle || subtitle" class="mt-4 text-sm text-muted-foreground">
              <slot name="subtitle">
                {{ subtitle }}
              </slot>
            </div>
          </slot>
        </header>

        <div
          class="pxd-modal--content px-6 py-4 sm:py-6 empty:py-3 h-full flex-1 overflow-auto"
          :class="contentClass"
        >
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="pxd-modal--footer px-4 pb-4 gap-2 relative flex shrink-0 items-center justify-between"
          :class="defaultStyles.footerClass"
        >
          <slot name="footer" />
        </footer>

        <PLoadingMask v-if="loading" :text="loadingText" />
      </div>
    </Transition>
  </POverlay>
</template>

<style>
.pxd-modal {
  max-height: min(800px, 80vh);
  max-height: min(800px, 80dvh);
}

.pxd-transition--modal-enter-active,
.pxd-transition--modal-leave-active {
  transition-property: transform, opacity;
}

.pxd-transition--modal-enter-from,
.pxd-transition--modal-leave-to {
  opacity: var(--o, 1);
  transform: var(--t, translate3d(0, 100%, 0));
}
</style>
