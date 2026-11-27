<script lang="ts" setup>
import type { DrawerEmits, DrawerProps } from './types'
import CrossIcon from '@gdsicon/vue/cross'
import { computed, shallowRef, watch } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useDialogLayer } from '../../composables/_internal/use-dialog-layer.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useSwipeDismiss } from '../../composables/_internal/use-swipe-dismiss.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getCssUnitValue } from '../../utils/format.js'
import { getUniqueId } from '../../utils/helper.js'
import PClientTeleport from '../_internal/client-teleport.vue'
import PButton from '../button/index.vue'
import PLoadingMask from '../loading-mask/index.vue'

defineOptions({
  name: 'PDrawer',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DrawerProps>(), {
  side: 'right',
  modelValue: false,
  initialFocus: false,
  defaultFooterStyle: true,
  defaultHeaderStyle: false,
  closeOnPressEscape: true,
  closeOnOutsideClick: true,
  closeable: false,
  swipeToClose: false,
})

const emits = defineEmits<DrawerEmits>()

const titleId = getUniqueId()
const subtitleId = getUniqueId()

const drawerRef = shallowRef<HTMLElement>()

const isVertical = computed(() => props.side === 'bottom' || props.side === 'top')
const swipeAvailable = computed(() => props.swipeToClose && isVertical.value)

const defaultStyles = computed(() => ({
  headerClass: props.defaultHeaderStyle
    ? 'border-b bg-background-200 dark:bg-background-100'
    : '-mbe-4',
  footerClass: props.defaultFooterStyle
    ? 'border-t bg-background-200 dark:bg-background-100'
    : '-mbs-3',
}))

const transitionName = computed(() => `pxd-transition--drawer-${props.side}`)

const computedStyle = computed(() => ({
  '--drawer-dimension': getCssUnitValue(props.dimension),
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

const { dragging: swipeDragging, settling: swipeSettling } = useSwipeDismiss(drawerRef, {
  visible: () => isVisible.value,
  enabled: () => swipeAvailable.value && !props.loading,
  motionReduced: () => !configProvider.enterMotion,
  position: () => props.side,
  onDismiss: (event) => closeIfAllowed('swipe', event),
})

useAgentNode({
  name: 'drawer',
  el: () => drawerRef.value,
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
      <Transition appear :name="transitionName" @after-leave="onAfterLeave">
        <div
          data-drawer
          v-if="isVisible"
          ref="drawerRef"
          :aria-labelledby="heading || $slots.heading ? titleId : undefined"
          :aria-describedby="subtitle || $slots.subtitle ? subtitleId : undefined"
          class="pxd-drawer group/drawer translate-z-0 data-swipe:data-[side=top]:pb-6 pointer-events-auto fixed isolate flex max-h-full max-w-full flex-col overflow-clip bg-background-100 shadow-border-modal outline-none data-[dragging]:overflow-visible data-[swipe-settling]:overflow-visible"
          :class="wrapperClass"
          :data-side="side"
          :data-enter-motion="configProvider.enterMotion"
          :data-leave-motion="configProvider.leaveMotion"
          :data-swipe-settling="swipeSettling || undefined"
          :data-dragging="swipeDragging || undefined"
          :data-swipe="swipeAvailable || undefined"
          v-bind="$attrs"
        >
          <div
            v-if="swipeAvailable"
            data-swipe-handle
            aria-hidden="true"
            class="pxd-drawer--handle w-18 min-h-10 py-2.5 after:h-1 after:w-9 absolute left-1/2 z-10 flex -translate-x-1/2 cursor-grab items-center justify-center group-data-dragging/drawer:cursor-grabbing after:block after:rounded-full after:bg-gray-300"
            :class="side === 'top' ? 'bottom-0' : 'top-0'"
          />

          <header
            class="pxd-drawer--header p-5 relative shrink-0 empty:hidden"
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
            class="pxd-drawer--content p-5 empty:py-2.5 h-full flex-1 overflow-auto"
            :class="contentClass"
          >
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="pxd-drawer--footer p-3 gap-2 relative flex shrink-0 items-center justify-between"
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

<style lang="postcss">
.pxd-drawer {
  translate: 0px calc(var(--swipe-offset, 0px)) 0px;

  &[data-side='left'] {
    left: 0;
    top: 0;
    bottom: 0;
  }

  &[data-side='top'] {
    left: 0;
    top: 0;
    right: 0;
  }

  &[data-side='right'] {
    right: 0;
    top: 0;
    bottom: 0;
  }

  &[data-side='bottom'] {
    left: 0;
    bottom: 0;
    right: 0;
  }
}

.pxd-drawer[data-side='left'],
.pxd-drawer[data-side='right'] {
  width: var(--drawer-dimension, 30svw);
}

.pxd-drawer[data-side='top'],
.pxd-drawer[data-side='bottom'] {
  height: var(--drawer-dimension, 30svh);
}

.pxd-drawer[data-side='top']::after,
.pxd-drawer[data-side='bottom']::after {
  content: '';
  position: absolute;
  right: 0;
  left: 0;
  height: 200%;
  background: inherit;
  pointer-events: none;
}

.pxd-drawer[data-side='bottom']::after {
  top: 100%;
}

.pxd-drawer[data-side='top']::after {
  bottom: 100%;
}

.pxd-transition--drawer-right-enter-active,
.pxd-transition--drawer-right-leave-active,
.pxd-transition--drawer-left-enter-active,
.pxd-transition--drawer-left-leave-active,
.pxd-transition--drawer-top-enter-active,
.pxd-transition--drawer-top-leave-active,
.pxd-transition--drawer-bottom-enter-active,
.pxd-transition--drawer-bottom-leave-active {
  transition-property: transform;
  transition-duration: var(--duration);
  transition-timing-function: var(--default-transition-timing-function);
}

.pxd-transition--drawer-right-leave-to,
.pxd-transition--drawer-right-enter-from {
  transform: translateX(100%);
}

.pxd-transition--drawer-left-leave-to,
.pxd-transition--drawer-left-enter-from {
  transform: translateX(-100%);
}

.pxd-transition--drawer-top-leave-to,
.pxd-transition--drawer-top-enter-from {
  transform: translateY(-100%);
}

.pxd-transition--drawer-bottom-leave-to,
.pxd-transition--drawer-bottom-enter-from {
  transform: translateY(100%);
}
</style>
