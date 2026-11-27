<script lang="ts" setup>
import type { ModalEmits, ModalProps } from './types'
import CrossIcon from '@gdsicon/vue/cross'
import { computed, shallowRef, watch } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useDialogLayer } from '../../composables/_internal/use-dialog-layer.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useSwipeDismiss } from '../../composables/_internal/use-swipe-dismiss.js'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from '../../composables/use-media-query.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getCssUnitValue } from '../../utils/format.js'
import { getUniqueId } from '../../utils/helper.js'
import PClientTeleport from '../_internal/client-teleport.vue'
import PButton from '../button/index.vue'
import PLoadingMask from '../loading-mask/index.vue'

defineOptions({
  name: 'PModal',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ModalProps>(), {
  modelValue: false,
  initialFocus: false,
  defaultFooterStyle: true,
  defaultHeaderStyle: false,
  closeOnPressEscape: true,
  closeOnOutsideClick: true,
  closeable: false,
  swipeToClose: false,
})

const emits = defineEmits<ModalEmits>()

const titleId = getUniqueId()
const subtitleId = getUniqueId()

const panelRef = shallowRef<HTMLElement>()

const computedStyle = computed(() => {
  return {
    '--modal-width': getCssUnitValue(props.width),
  }
})

const defaultStyles = computed(() => ({
  headerClass: props.defaultHeaderStyle
    ? 'border-b bg-background-200 dark:bg-background-100'
    : '-mbe-4',
  footerClass: props.defaultFooterStyle
    ? 'border-t bg-background-200 dark:bg-background-100'
    : '-mbs-3',
}))

const { modelValue: isVisible, change } = useModelValue(props, emits)
const configProvider = useConfigProvider()

const {
  setDialogRef,
  isClosing,
  closeIfAllowed,
  onCancel,
  onNativeClose,
  onDialogPointerDown,
  onDialogSubmit,
  onAfterLeave,
} = useDialogLayer({
  visible: () => isVisible.value,
  loading: () => props.loading,
  initialFocus: () => props.initialFocus,
  closeOnPressEscape: () => props.closeOnPressEscape,
  closeOnOutsideClick: () => props.closeOnOutsideClick,
  onClose: (reason, event) => {
    emits('close', reason)
    return change(false, { reason, event })
  },
  onOutsidePress: (ev) => emits('outside-click', ev),
})

const isCompact = useMediaQuery(PRESET_MEDIA_QUERIES.IS_XS)
const swipeAvailable = computed(() => props.swipeToClose && isCompact.value)

const { dragging: swipeDragging, settling: swipeSettling } = useSwipeDismiss(panelRef, {
  visible: () => isVisible.value,
  enabled: () => swipeAvailable.value && !props.loading,
  motionReduced: () => !configProvider.enterMotion,
  position: () => 'bottom',
  onDismiss: (event) => closeIfAllowed('swipe', event),
})

useAgentNode({
  name: 'modal',
  el: () => panelRef.value,
  state: () => ({ open: isVisible.value }),
  actions: {
    setOpen: (open) => {
      change(Boolean(open), { reason: 'api' })
    },
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
  <PClientTeleport to="body">
    <dialog
      :ref="setDialogRef"
      class="pxd-dialog inset-0 m-0 p-0 pointer-events-auto fixed size-full max-h-full max-w-full overflow-visible border-0 bg-transparent text-inherit outline-none backdrop:animate-dialog-backdrop backdrop:bg-background-100/80 backdrop:transition-opacity data-closing:backdrop:opacity-0"
      :data-closing="isClosing || undefined"
      :style="computedStyle"
      :aria-labelledby="heading || $slots.heading ? titleId : undefined"
      :aria-describedby="subtitle || $slots.subtitle ? subtitleId : undefined"
      @cancel="onCancel"
      @close="onNativeClose"
      @pointerdown="onDialogPointerDown"
      @submit="onDialogSubmit"
    >
      <Transition appear name="pxd-transition--modal" @after-leave="onAfterLeave">
        <div
          data-modal
          v-if="isVisible"
          ref="panelRef"
          class="pxd-modal group/modal left-0 translate-z-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:[--o:0] sm:[--t:scale(0.98)] sm:w-(--modal-width) max-sm:bottom-0 pointer-events-auto fixed isolate flex w-full max-w-full flex-col overflow-clip rounded-t-lg bg-background-100 shadow-border-modal default-transition-duration default-transition-timing-function outline-none data-[dragging]:overflow-visible data-[swipe-settling]:overflow-visible motion-safe:transition-[opacity,transform,scale,background-color,box-shadow,border-color,color] dark:bg-background-200"
          :class="wrapperClass"
          :aria-labelledby="heading || $slots.heading ? titleId : undefined"
          :aria-describedby="subtitle || $slots.subtitle ? subtitleId : undefined"
          :data-enter-motion="configProvider.enterMotion"
          :data-leave-motion="configProvider.leaveMotion"
          :data-swipe-settling="swipeSettling || undefined"
          :data-dragging="swipeDragging || undefined"
          v-bind="$attrs"
        >
          <div
            v-if="swipeToClose"
            data-swipe-handle
            aria-hidden="true"
            class="pxd-modal--handle top-0 sm:hidden w-18 min-h-10 py-2.5 after:h-1 after:w-9 absolute left-1/2 z-10 flex -translate-x-1/2 cursor-grab items-center justify-center group-data-dragging/modal:cursor-grabbing after:block after:rounded-full after:bg-gray-300"
          />

          <header
            class="pxd-modal--header p-5 relative shrink-0 empty:hidden"
            :class="[defaultStyles.headerClass, { 'pe-13': closeable }]"
          >
            <slot name="header">
              <h3
                v-if="heading || $slots.heading"
                :id="titleId"
                class="text-lg font-semibold tracking-tight m-0"
              >
                <slot name="heading">
                  {{ heading }}
                </slot>
              </h3>

              <div
                v-if="subtitle || $slots.subtitle"
                :id="subtitleId"
                class="mbs-1 text-sm text-gray-900"
              >
                <slot name="subtitle">
                  {{ subtitle }}
                </slot>
              </div>
            </slot>

            <PButton
              v-if="closeable"
              icon-only
              size="xs"
              variant="ghost"
              class="top-5 right-5 absolute"
              :aria-label="configProvider.locale.interaction.close"
              :title="configProvider.locale.interaction.close"
              @click="closeIfAllowed('close-press', $event)"
            >
              <CrossIcon class="size-3" />
            </PButton>
          </header>

          <div
            class="pxd-modal--content empty:py-2.5 p-5 h-full flex-1 overflow-auto"
            :class="contentClass"
          >
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="pxd-modal--footer p-3 gap-2 relative flex shrink-0 items-center justify-between"
            :class="defaultStyles.footerClass"
          >
            <slot name="footer" />
          </footer>

          <PLoadingMask v-if="loading" :text="loadingText" />
        </div>
      </Transition>
    </dialog>
  </PClientTeleport>
</template>

<style>
.pxd-modal {
  max-height: min(50rem, 80svh);
  translate: 0px calc(var(--swipe-offset, 0px)) 0px;
}

@media (min-width: 40rem) {
  .pxd-modal {
    translate: var(--tw-translate-x, 0px) var(--tw-translate-y, 0px);
  }
}

@supports (translate: round(nearest, 50%, 1px)) {
  @media (min-width: 40rem) {
    .pxd-modal {
      translate: round(nearest, var(--tw-translate-x, 0px), 1px)
        round(nearest, var(--tw-translate-y, 0px), 1px);
    }
  }
}

.pxd-modal::after {
  content: '';
  position: absolute;
  right: 0;
  left: 0;
  top: 100%;
  height: 200%;
  background: inherit;
  pointer-events: none;
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
