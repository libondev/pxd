<script lang="ts" setup>
import type { ModalEmits, ModalProps } from './types'
import CrossIcon from '@gdsicon/vue/cross'
import { computed, shallowRef, watch } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useOverlayDialog } from '../../composables/_internal/use-overlay-dialog.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getCssUnitValue } from '../../utils/format.js'
import PLoadingMask from '../_internal/loading-mask.vue'
import PButton from '../button/index.vue'
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
  autoFocusElement: false,
  defaultFooterStyle: true,
  defaultHeaderStyle: false,
  closeOnPressEscape: true,
  closeOnClickOverlay: true,
  closeable: false,
})

const emits = defineEmits<ModalEmits>()

const modalRef = shallowRef<HTMLElement>()
const computedStyle = computed(() => {
  return {
    '--modal-index': props.zIndex,
    '--modal-width': getCssUnitValue(props.width),
  }
})

const defaultStyles = computed(() => ({
  headerClass: props.defaultHeaderStyle
    ? 'pbe-5 border-b bg-background-200 dark:bg-background-100'
    : '',
  footerClass: props.defaultFooterStyle
    ? 'pbs-3 border-t bg-background-200 dark:bg-background-100'
    : '',
}))

const isVisible = useModelValue(props, emits)
const configProvider = useConfigProvider()
const { closeOverlayIfNeed, onOverlayClick } = useOverlayDialog({
  props,
  emits,
  elementRef: modalRef,
  onClose: () => {
    isVisible.value = false
  },
})

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
    :z-index="zIndex"
    :close-on-press-escape="closeOnPressEscape"
    @escape="closeOverlayIfNeed"
    @click="onOverlayClick"
  >
    <Transition name="pxd-transition--modal" mode="out-in" appear>
      <div
        data-modal
        v-if="isVisible"
        ref="modalRef"
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        :aria-expanded="isVisible"
        class="pxd-modal group/modal left-0 translate-z-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:[--o:0] sm:[--t:scale(0.98)] sm:w-(--modal-width) max-sm:bottom-0 pointer-events-auto fixed z-(--modal-index) flex w-full max-w-full flex-col overflow-hidden rounded-t-lg bg-background-100 shadow-border-modal outline-none motion-safe:transition-appearance dark:bg-background-200"
        :class="wrapperClass"
        :style="computedStyle"
        :data-enter-motion="configProvider.enterMotion"
        :data-leave-motion="configProvider.leaveMotion"
        v-bind="$attrs"
      >
        <header
          class="pxd-modal--header px-5 pbs-5 relative shrink-0 empty:hidden"
          :class="[defaultStyles.headerClass, { 'pe-13': closeable }]"
        >
          <slot name="header">
            <h3 v-if="title || $slots.title" class="text-lg font-semibold tracking-tight m-0">
              <slot name="title">
                {{ title }}
              </slot>
            </h3>

            <div v-if="subtitle || $slots.subtitle" class="mbs-1 text-sm text-gray-900">
              <slot name="subtitle">
                {{ subtitle }}
              </slot>
            </div>
          </slot>

          <PButton
            v-if="closeable"
            variant="ghost"
            size="sm"
            icon
            class="top-4 right-5 sm:top-5 size-7 absolute"
            :aria-label="configProvider.locale.interaction.close"
            :title="configProvider.locale.interaction.close"
            @click="closeOverlayIfNeed"
          >
            <CrossIcon class="size-3" aria-hidden="true" />
          </PButton>
        </header>

        <div class="pxd-modal--content p-5 h-full flex-1 overflow-auto" :class="contentClass">
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="pxd-modal--footer px-3 pbe-3 gap-2 relative flex shrink-0 items-center justify-between"
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
