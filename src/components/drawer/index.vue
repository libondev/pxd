<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { ComponentLabel } from '../../types/components'
import CloseIcon from '@gdsicon/vue/cross'
import { computed, shallowRef, watch } from 'vue'
import { useFocusTrap } from '../../composables/useFocusTrap'
import { useModelValue } from '../../composables/useModelValue'
import { getCssUnitValue } from '../../utils/format'
import PButton from '../button/index.vue'
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
  showCloseButton?: boolean
  closeOnClickOverlay?: boolean
  closeOnPressEscape?: boolean
  position?: 'top' | 'right' | 'bottom' | 'left'
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
    showCloseButton: true,
    closeOnClickOverlay: true,
    closeOnPressEscape: true,
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
const contentClasses = computed(() => {
  const baseClasses = ['pxd-drawer outline-none translate-z-0 shadow-border-modal fixed bg-background flex flex-col z-10']

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

function onDrawerKeydown() {
  if (!props.closeOnPressEscape) {
    return
  }

  isVisible.value = false
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
          class="pxd-drawer--header flex gap-2 items-start justify-between px-6 py-4 sm:py-6"
          :class="{ 'border-b bg-background-secondary dark:bg-background': headerStyle }"
        >
          <div class="flex-1 shrink-0">
            <h3 class="text-base sm:text-2xl font-semibold tracking-tight">
              <slot name="title">
                {{ title }}
              </slot>
            </h3>

            <div v-if="subtitle" class="mt-4 text-sm text-muted-foreground">
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
            class="shrink-0"
            @click="closeDrawer"
          >
            <CloseIcon class="h-4 w-4" />
          </PButton>
        </header>

        <PScrollable
          :data-header="headerStyle"
          class="pxd-drawer--content group flex-1"
          content-class="group-data-[header=true]:pt-6 px-6 pb-6"
        >
          <slot />
        </PScrollable>

        <footer
          v-if="$slots.footer"
          class="pxd-drawer--footer bg-background flex items-center justify-between border-t min-h-12 gap-2 p-4 shrink-0"
          :class="{ 'border-t bg-background-secondary dark:bg-background': footerStyle }"
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
