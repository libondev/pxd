<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { ComponentLabel } from '../../types/components'
import CloseIcon from '@gdsicon/vue/cross'
import { computed, nextTick, watch } from 'vue'
import { useFocusTrap } from '../../composables/useFocusTrap'
import { useModelValue } from '../../composables/useModelValue'
import { getCssUnitValue } from '../../utils/format'
import PButton from '../button/index.vue'
import POverlay from '../overlay/index.vue'
import PScrollable from '../scrollable/index.vue'

interface Props {
  title?: ComponentLabel
  subtitle?: ComponentLabel
  modelValue?: boolean
  appendToBody?: boolean
  closeOnClickOverlay?: boolean
  closeOnPressEscape?: boolean
  showCloseButton?: boolean
  position?: 'top' | 'right' | 'bottom' | 'left'
  width?: number | string
  height?: number | string
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
    modelValue: false,
    appendToBody: true,
    closeOnClickOverlay: true,
    closeOnPressEscape: true,
    showCloseButton: true,
    position: 'right',
    width: '300px',
    height: '300px',
  },
)

const emits = defineEmits<{
  'open': []
  'close': []
  'click-outside': [MouseEvent]
  'update:modelValue': [boolean]
}>()

const isVisible = useModelValue(props, emits)
const { containerRef: drawerRef } = useFocusTrap()

const ensureCorrectPosition = computed(() => {
  const { position } = props
  if (['top', 'bottom', 'left', 'right'].includes(position)) {
    return position
  }

  return 'right'
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

function onDrawerKeydown() {
  if (!props.closeOnPressEscape) {
    return
  }

  isVisible.value = false
}

watch(() => isVisible.value, (visible) => {
  nextTick(() => {
    if (visible) {
      emits('open')
      return
    }

    emits('close')
  })
}, { flush: 'post' })

// 计算内容位置类名
const contentClasses = computed(() => {
  const baseClasses = [
    'pxd-drawer',
    'outline-none translate-z-0 shadow-border-modal',
    'fixed',
    'bg-background',
    'shadow-lg',
    'flex',
    'flex-col',
    'z-10',
  ]

  switch (ensureCorrectPosition.value) {
    case 'top':
      baseClasses.push('top-0', 'left-0', 'right-0')
      break
    case 'right':
      baseClasses.push('top-0', 'right-0', 'bottom-0')
      break
    case 'bottom':
      baseClasses.push('bottom-0', 'left-0', 'right-0')
      break
    case 'left':
      baseClasses.push('top-0', 'left-0', 'bottom-0')
      break
  }

  return baseClasses
})

// 计算容器宽高
const contentStyle = computed(() => {
  const style: CSSProperties = {}

  if (['left', 'right'].includes(ensureCorrectPosition.value)) {
    style.width = getCssUnitValue(props.width)
  } else {
    style.height = getCssUnitValue(props.height)
  }

  return style
})

// 计算动画名称
const transitionName = computed(() => {
  return `pxd-transition--drawer-slide-${ensureCorrectPosition.value}`
})
</script>

<template>
  <POverlay v-model="isVisible" :append-to-body="appendToBody" @click="onOverlayClick">
    <Transition :name="transitionName" mode="out-in">
      <div
        v-if="isVisible"
        ref="drawerRef"
        aria-modal="true"
        role="dialog"
        tabindex="-1"
        :class="contentClasses"
        :style="contentStyle"
        @keydown.esc="onDrawerKeydown"
      >
        <header
          v-if="$slots.title || $slots.subtitle || title || subtitle"
          class="pxd-drawer--header flex items-start justify-between p-6 border-b"
        >
          <div class="flex-1">
            <h3 class="text-2xl font-semibold tracking-tight">
              <slot name="title">
                {{ title }}
              </slot>
            </h3>

            <div v-if="subtitle" class="mt-2 text-sm text-muted-foreground">
              <slot name="subtitle">
                {{ subtitle }}
              </slot>
            </div>
          </div>

          <PButton
            v-if="showCloseButton"
            variant="ghost"
            size="sm"
            icon
            class="ml-4 flex-shrink-0"
            @click="closeDrawer"
          >
            <CloseIcon class="h-4 w-4" />
          </PButton>
        </header>

        <PScrollable
          class="pxd-drawer--content flex-1"
          content-class="p-6"
        >
          <slot />
        </PScrollable>

        <footer
          v-if="$slots.footer"
          class="pxd-drawer--footer bg-background flex items-center justify-end border-t min-h-12 gap-4 px-6 py-3 flex-shrink-0"
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
