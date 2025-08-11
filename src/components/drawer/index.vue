<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { BasePosition, ComponentLabel } from '../../types/shared'
import { computed, shallowRef, watch } from 'vue'
import { useFocusTrap } from '../../composables/use-focus-trap'
import { useModelValue } from '../../composables/use-model-value'
import { getCssUnitValue } from '../../utils/format'
import POverlay from '../overlay/index.vue'
import PScrollable from '../scrollable/index.vue'

interface Props {
  size?: number | string
  title?: ComponentLabel
  subtitle?: ComponentLabel
  modelValue?: boolean
  headerStyle?: boolean
  footerStyle?: boolean
  appendToBody?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
  position?: BasePosition
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
    size: '30%',
    position: 'right',
    modelValue: false,
    footerStyle: true,
    headerStyle: false,
    appendToBody: true,
    closeOnPressEscape: true,
    closeOnClickOverlay: true,
  },
)

const emits = defineEmits<{
  'open': []
  'close': []
  'click-outside': [MouseEvent]
  'update:modelValue': [boolean]
}>()

const drawerRef = shallowRef<HTMLElement>()
const isVisible = useModelValue(props, emits)

useFocusTrap(drawerRef)

const ensureCorrectPosition = computed(() => {
  const { position } = props
  if (['top', 'bottom', 'left', 'right'].includes(position)) {
    return position
  }

  return 'right'
})

// 计算动画名称
const transitionName = computed(() => {
  return `pxd-transition--drawer-slide-${ensureCorrectPosition.value}`
})

// 计算内容位置类名
const computedClass = computed(() => {
  const classes = ['pxd-drawer translate-z-0 fixed z-10 flex flex-col bg-background-100 shadow-border-modal outline-none']

  switch (ensureCorrectPosition.value) {
    case 'top':
      classes.push('top-0', 'left-0', 'right-0')
      break
    case 'right':
      classes.push('top-0', 'right-0', 'bottom-0')
      break
    case 'bottom':
      classes.push('bottom-0', 'left-0', 'right-0')
      break
    case 'left':
      classes.push('top-0', 'left-0', 'bottom-0')
      break
  }

  return classes.join(' ')
})

// 计算容器宽高
const computedStyle = computed(() => {
  const style: CSSProperties = {}

  const sizeField = ['left', 'right'].includes(ensureCorrectPosition.value) ? 'width' : 'height'

  style[sizeField] = getCssUnitValue(props.size)

  return style
})

function onOverlayClick(ev: MouseEvent) {
  emits('click-outside', ev)

  if (!props.closeOnClickOverlay) {
    return
  }

  closeDrawer()
}

function closeDrawer() {
  isVisible.value = false
  emits('close')
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
    v-model="isVisible"
    :append-to-body="appendToBody"
    :close-on-press-escape="closeOnPressEscape"
    @click="onOverlayClick"
  >
    <Transition :name="transitionName" mode="out-in">
      <div
        v-if="isVisible"
        ref="drawerRef"
        aria-modal="true"
        role="dialog"
        tabindex="-1"
        :class="computedClass"
        :style="computedStyle"
      >
        <header
          class="pxd-drawer--header p-6 sm:py-4 relative shrink-0 empty:py-3"
          :class="{ 'border-b bg-background-200 dark:bg-background-100': headerStyle }"
        >
          <h3 v-if="$slots.title || title" class="text-xl font-semibold tracking-tight">
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
          :data-header="headerStyle"
          class="pxd-drawer--content group flex-1"
          content-class="group-data-[header=true]:pt-5 px-6 pb-5"
        >
          <slot />
        </PScrollable>

        <footer
          v-if="$slots.footer"
          class="pxd-drawer--footer p-4 gap-2 relative flex shrink-0 items-center justify-between"
          :class="{ 'border-t bg-background-200 dark:bg-background-100': footerStyle }"
        >
          <slot name="footer" />
        </footer>
      </div>
    </Transition>
  </POverlay>
</template>

<style>
/* 右侧滑入滑出动画 */
.pxd-transition--drawer-slide-right-enter-active,
.pxd-transition--drawer-slide-right-leave-active,
/* 左侧滑入滑出动画 */
.pxd-transition--drawer-slide-left-enter-active,
.pxd-transition--drawer-slide-left-leave-active,
/* 顶部滑入滑出动画 */
.pxd-transition--drawer-slide-top-enter-active,
.pxd-transition--drawer-slide-top-leave-active,
/* 底部滑入滑出动画 */
.pxd-transition--drawer-slide-bottom-enter-active,
.pxd-transition--drawer-slide-bottom-leave-active  {
  transition: transform var(--default-transition-duration, 0.3s) var(--default-transition-timing-function);
}

.pxd-transition--drawer-slide-right-leave-to,
.pxd-transition--drawer-slide-right-enter-from {
  transform: translateX(100%);
}

.pxd-transition--drawer-slide-left-leave-to,
.pxd-transition--drawer-slide-left-enter-from {
  transform: translateX(-100%);
}

.pxd-transition--drawer-slide-top-leave-to,
.pxd-transition--drawer-slide-top-enter-from {
  transform: translateY(-100%);
}

.pxd-transition--drawer-slide-bottom-leave-to,
.pxd-transition--drawer-slide-bottom-enter-from {
  transform: translateY(100%);
}
</style>
