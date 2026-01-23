<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { BasePosition, ComponentClass, ComponentLabel } from '../../types/shared'
import { computed, shallowRef, watch } from 'vue'
import { useFocusTrap } from '../../composables/use-focus-trap'
import { useModelValue } from '../../composables/use-model-value'
import { getCssUnitValue, isTruthyProp } from '../../utils/format'
import POverlay from '../overlay/index.vue'

interface Props {
  title?: ComponentLabel
  subtitle?: ComponentLabel
  size?: number | string
  loading?: boolean
  position?: BasePosition
  modelValue?: boolean
  appendToBody?: boolean
  headerStylize?: boolean
  footerStylize?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
  initialFocus?: string | false
}

defineOptions({
  name: 'PDrawer',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    position: 'right',
    modelValue: false,
    appendToBody: true,
    footerStylize: true,
    headerStylize: false,
    closeOnPressEscape: true,
    closeOnClickOverlay: true,
  },
)

const emits = defineEmits<{
  'show': []
  'hide': []
  'change': [boolean]
  'outside-click': [MouseEvent]
  'visible-change': [boolean]
  'update:modelValue': [boolean]
}>()

const drawerRef = shallowRef<HTMLElement>()
const isVisible = useModelValue(props, emits)

useFocusTrap(drawerRef, {
  initialFocus: props.initialFocus,
  escapeDeactivates: props.closeOnPressEscape,
  clickOutsideDeactivates: props.closeOnClickOverlay,
})

const ensurePosition = computed(() => {
  const { position } = props
  if (['top', 'bottom', 'left', 'right'].includes(position)) {
    return position
  }

  return 'right'
})

const transitionName = computed(() => `pxd-transition--drawer-${ensurePosition.value}`)

const computedStyle = computed(() => {
  const styles: CSSProperties = {}

  if (props.size) {
    styles['--drawer-size'] = getCssUnitValue(props.size)
  }

  return styles
})

function closeOverlayIfNeed() {
  if (isTruthyProp(props.loading)) {
    return
  }

  isVisible.value = false
}

function onOverlayClick(ev: MouseEvent) {
  emits('outside-click', ev)

  if (!isTruthyProp(props.closeOnClickOverlay)) {
    return
  }

  closeOverlayIfNeed()
}

watch(() => isVisible.value, (visible) => {
  emits('visible-change', visible)

  if (visible) {
    emits('show')
    return
  }

  emits('hide')
})
</script>

<template>
  <POverlay
    :model-value="isVisible"
    :append-to-body="appendToBody"
    :close-on-press-escape="closeOnPressEscape"
    @escape="closeOverlayIfNeed"
    @click="onOverlayClick"
  >
    <Transition :name="transitionName" mode="out-in" appear>
      <div
        v-if="isVisible"
        ref="drawerRef"
        aria-modal="true"
        role="dialog"
        tabindex="-1"
        class="pxd-drawer group/drawer translate-z-0 sm:[--drawer-width:30vw] sm:[--drawer-height:30vw] pointer-events-auto fixed z-10 flex max-h-full max-w-full flex-col bg-background-100 shadow-border-modal outline-none"
        :class="wrapperClass"
        :style="computedStyle"
        :data-position="ensurePosition"
      >
        <header
          class="pxd-drawer--header px-6 pt-4 sm:pt-6 relative shrink-0 empty:py-3"
          :class="{ 'pb-4 sm:pb-6 border-b bg-background-200 dark:bg-background-100': headerStylize }"
        >
          <slot name="header">
            <h3 v-if="$slots.title || title" class="text-lg sm:text-xl font-semibold tracking-tight m-0">
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
          class="pxd-drawer--content px-6 py-4 sm:py-6 h-full flex-1 overflow-auto empty:py-3"
          :class="contentClass"
        >
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="pxd-drawer--footer p-4 gap-2 relative flex shrink-0 items-center justify-between"
          :class="{ 'border-t bg-background-200 dark:bg-background-100': footerStylize }"
        >
          <slot name="footer" />
        </footer>
      </div>
    </Transition>
  </POverlay>
</template>

<style>
.pxd-drawer {
  &[data-position="left"] {
    left: 0;
    top: 0;
    bottom: 0;
  }

  &[data-position="top"] {
    left: 0;
    top: 0;
    right: 0;
  }

  &[data-position="right"] {
    right: 0;
    top: 0;
    bottom: 0;
  }

  &[data-position="bottom"] {
    left: 0;
    bottom: 0;
    right: 0;
  }
}

.pxd-drawer[data-position="left"],
.pxd-drawer[data-position="right"] {
  width: var(--drawer-size, var(--drawer-width, 80vw));
}

.pxd-drawer[data-position="top"],
.pxd-drawer[data-position="bottom"] {
  height: var(--drawer-size, var(--drawer-height, 80vw));
}

.pxd-transition--drawer-right-enter-active,
.pxd-transition--drawer-right-leave-active,
.pxd-transition--drawer-left-enter-active,
.pxd-transition--drawer-left-leave-active,
.pxd-transition--drawer-top-enter-active,
.pxd-transition--drawer-top-leave-active,
.pxd-transition--drawer-bottom-enter-active,
.pxd-transition--drawer-bottom-leave-active  {
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
