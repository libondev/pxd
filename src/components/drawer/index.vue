<script lang="ts" setup>
import type { DrawerEmits, DrawerProps } from './types'
import CrossIcon from '@gdsicon/vue/cross'
import { computed, shallowRef, watch } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useOverlayDialog } from '../../composables/_internal/use-overlay-dialog.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getCssUnitValue } from '../../utils/format.js'
import PButton from '../button/index.vue'
import PLoadingMask from '../loading-mask/index.vue'
import POverlay from '../overlay/index.vue'

defineOptions({
  name: 'PDrawer',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:model-value',
  },
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
})

const emits = defineEmits<DrawerEmits>()

const drawerRef = shallowRef<HTMLElement>()
const ensurePosition = computed(() => {
  const { position } = props
  if (['top', 'bottom', 'left', 'right'].includes(position)) {
    return position
  }

  return 'right'
})

const defaultStyles = computed(() => ({
  headerClass: props.defaultHeaderStyle
    ? 'border-b bg-background-200 dark:bg-background-100'
    : '-mbe-5',
  footerClass: props.defaultFooterStyle
    ? 'border-t bg-background-200 dark:bg-background-100'
    : '-mbs-3',
}))

const transitionName = computed(() => `pxd-transition--drawer-${ensurePosition.value}`)

const computedStyle = computed(() => ({
  '--modal-index': props.zIndex,
  '--drawer-size': getCssUnitValue(props.size),
}))

const isVisible = useModelValue(props, emits)
const configProvider = useConfigProvider()
const { closeOverlayIfNeed, onOverlayClick } = useOverlayDialog({
  props,
  emits,
  elementRef: drawerRef,
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
    <Transition
      appear
      mode="out-in"
      :name="transitionName"
      class="default-transition-duration default-transition-timing-function"
    >
      <div
        data-drawer
        v-if="isVisible"
        ref="drawerRef"
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        :aria-expanded="isVisible"
        class="pxd-drawer group/drawer translate-z-0 pointer-events-auto fixed z-(--modal-index) flex max-h-full max-w-full flex-col overflow-clip bg-background-100 shadow-border-modal outline-none"
        :class="wrapperClass"
        :style="computedStyle"
        :data-position="ensurePosition"
        :data-enter-motion="configProvider.enterMotion"
        :data-leave-motion="configProvider.leaveMotion"
        v-bind="$attrs"
      >
        <header
          class="pxd-drawer--header p-5 relative shrink-0 empty:hidden"
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
            icon
            size="xs"
            variant="ghost"
            class="top-5 right-4 absolute"
            :aria-label="configProvider.locale.interaction.close"
            :title="configProvider.locale.interaction.close"
            @click="closeOverlayIfNeed"
          >
            <CrossIcon class="size-3" />
          </PButton>
        </header>

        <div
          class="pxd-drawer--content p-5 h-full flex-1 scrollbar-gutter-stable overflow-auto"
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
  </POverlay>
</template>

<style lang="postcss">
.pxd-drawer {
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
  width: var(--drawer-size, 30vw);
}

.pxd-drawer[data-position='top'],
.pxd-drawer[data-position='bottom'] {
  height: var(--drawer-size, 30vh);
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
