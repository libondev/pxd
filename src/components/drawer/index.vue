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
  position: 'right',
  modelValue: false,
  autoFocusElement: false,
  defaultFooterStyle: true,
  defaultHeaderStyle: false,
  closeOnPressEscape: true,
  closeOnClickOverlay: true,
  closeable: false,
  swipeToClose: false,
})

const emits = defineEmits<DrawerEmits>()

const titleId = getUniqueId()
const subtitleId = getUniqueId()

const drawerRef = shallowRef<HTMLElement>()

const isVertical = computed(() => props.position === 'bottom' || props.position === 'top')
const swipeAvailable = computed(() => props.swipeToClose && isVertical.value)

const defaultStyles = computed(() => ({
  headerClass: props.defaultHeaderStyle
    ? 'border-b bg-background-200 dark:bg-background-100'
    : '-mbe-4',
  footerClass: props.defaultFooterStyle
    ? 'border-t bg-background-200 dark:bg-background-100'
    : '-mbs-3',
}))

const transitionName = computed(() => `pxd-transition--drawer-${props.position}`)

const computedStyle = computed(() => ({
  '--drawer-size': getCssUnitValue(props.size),
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
  autoFocusElement: () => props.autoFocusElement,
  closeOnPressEscape: () => props.closeOnPressEscape,
  closeOnClickOverlay: () => props.closeOnClickOverlay,
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
  position: () => props.position,
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
      class="pxd-dialog inset-0 m-0 p-0 pointer-events-auto fixed size-full max-h-full max-w-full overflow-visible border-0 bg-transparent text-inherit backdrop:animate-dialog-backdrop backdrop:bg-background-100/80 backdrop:transition-opacity data-closing:backdrop:opacity-0"
      :data-closing="isClosing || undefined"
      :style="computedStyle"
      :aria-labelledby="title || $slots.title ? titleId : undefined"
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
          :aria-labelledby="title || $slots.title ? titleId : undefined"
          :aria-describedby="subtitle || $slots.subtitle ? subtitleId : undefined"
          class="pxd-drawer group/drawer translate-z-0 data-swipe:data-[position=top]:pb-6 pointer-events-auto fixed isolate flex max-h-full max-w-full flex-col overflow-clip bg-background-100 shadow-border-modal outline-none data-[dragging]:overflow-visible data-[swipe-settling]:overflow-visible"
          :class="wrapperClass"
          :data-position="position"
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
            :class="position === 'top' ? 'bottom-0' : 'top-0'"
          />

          <header
            class="pxd-drawer--header p-5 relative shrink-0 empty:hidden"
            :class="[defaultStyles.headerClass, { 'pe-13': closeable }]"
          >
            <slot name="header">
              <h3
                v-if="title || $slots.title"
                :id="titleId"
                class="text-lg font-semibold tracking-tight m-0"
              >
                <slot name="title">
                  {{ title }}
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
              icon
              size="xs"
              variant="ghost"
              class="top-5 right-4 absolute"
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

  &[data-position='left'] {
    left: 0;
    top: 0;
    bottom: 0;
  }

  &[data-position='top'] {
    left: 0;
    top: 0;
    right: 0;
  }

  &[data-position='right'] {
    right: 0;
    top: 0;
    bottom: 0;
  }

  &[data-position='bottom'] {
    left: 0;
    bottom: 0;
    right: 0;
  }
}

.pxd-drawer[data-position='left'],
.pxd-drawer[data-position='right'] {
  width: var(--drawer-size, 30svw);
}

.pxd-drawer[data-position='top'],
.pxd-drawer[data-position='bottom'] {
  height: var(--drawer-size, 30svh);
}

.pxd-drawer[data-position='top']::after,
.pxd-drawer[data-position='bottom']::after {
  content: '';
  position: absolute;
  right: 0;
  left: 0;
  height: 200%;
  background: inherit;
  pointer-events: none;
}

.pxd-drawer[data-position='bottom']::after {
  top: 100%;
}

.pxd-drawer[data-position='top']::after {
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
  transition-timing-function: var(--ease-drawer, cubic-bezier(0.32, 0.72, 0, 1));
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
