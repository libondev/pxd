<script lang="ts" setup>
import type { DrawerEmits, DrawerProps } from './types'
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
  name: 'PDrawer',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
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
    ? 'pbe-4 sm:pbe-6 border-b bg-background-200 dark:bg-background-100'
    : '',
  footerClass: props.defaultFooterStyle
    ? 'border-t pbs-4 bg-background-200 dark:bg-background-100'
    : '',
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
        class="pxd-drawer group/drawer translate-z-0 pointer-events-auto fixed z-(--modal-index) flex max-h-full max-w-full flex-col bg-background-100 shadow-border-modal outline-none"
        :class="wrapperClass"
        :style="computedStyle"
        :data-position="ensurePosition"
        :data-enter-motion="configProvider.enterMotion"
        :data-leave-motion="configProvider.leaveMotion"
        v-bind="$attrs"
      >
        <header
          class="pxd-drawer--header px-6 pbs-4 sm:pbs-6 relative shrink-0 empty:hidden"
          :class="[defaultStyles.headerClass, { 'pe-15': closeable }]"
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

            <div v-if="$slots.subtitle || subtitle" class="mbs-4 text-sm text-muted-foreground">
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
            class="top-4 right-6 sm:top-6 size-7 absolute"
            :aria-label="configProvider.locale.interaction.close"
            :title="configProvider.locale.interaction.close"
            @click="closeOverlayIfNeed"
          >
            <CrossIcon class="size-3" aria-hidden="true" />
          </PButton>
        </header>

        <div
          class="pxd-drawer--content px-6 py-4 sm:py-6 empty:py-3 h-full flex-1 overflow-auto"
          :class="contentClass"
        >
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="pxd-drawer--footer px-4 pbe-4 gap-2 relative flex shrink-0 items-center justify-between"
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
