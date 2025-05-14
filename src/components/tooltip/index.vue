<script lang="ts" setup>
import type { ComponentVariant } from '../../types/components'
import { nextTick, onMounted, onUnmounted, shallowRef } from 'vue'

interface Props {
  delay?: number
  width?: string
  content?: string
  disabled?: boolean
  enterable?: boolean
  showArrow?: boolean
  variant?: ComponentVariant
  trigger?: 'hover' | 'click' | 'focus'
  position?: 'top' | 'right' | 'bottom' | 'left'
}

defineOptions({
  name: 'PTooltip',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    delay: 200,
    width: 'auto',
    position: 'top',
    enterable: true,
    showArrow: true,
    trigger: 'hover',
    variant: 'primary',
  },
)

const VARIANTS = {
  primary: 'var(--color-primary)',
  error: 'var(--color-red-700)',
  warning: 'var(--color-amber-700)',
  success: 'var(--color-green-700)',
}

const isVisible = shallowRef(false)
const tooltipRef = shallowRef<HTMLElement>()
const triggerRef = shallowRef<HTMLElement>()
const tooltipStyle = shallowRef<{
  left: string
  top: string
}>()

const computedTooltipStyles = computed(() => {
  const bgColor = VARIANTS[props.variant] || VARIANTS.primary

  return {
    'width': props.width,
    ...tooltipStyle.value,
    '--arrow-color': bgColor,
    'backgroundColor': bgColor,
    'color': props.variant === 'warning' ? 'var(--color-gray-1000)' : undefined,
  }
})

let isMouseInTooltip = false
let isMouseInTrigger = false

function calculatePosition() {
  if (!triggerRef.value || !tooltipRef.value)
    return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const position = props.position

  let left = 0
  let top = 0

  switch (position) {
    case 'top':
      left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      top = triggerRect.top - tooltipRect.height - 8
      break
    case 'right':
      left = triggerRect.right + 8
      top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
      break
    case 'bottom':
      left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      top = triggerRect.bottom + 8
      break
    case 'left':
      left = triggerRect.left - tooltipRect.width - 8
      top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
      break
  }

  // 边界检查，确保tooltip在视窗内
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  if (left < 0)
    left = 0
  if (top < 0)
    top = 0
  if (left + tooltipRect.width > viewportWidth)
    left = viewportWidth - tooltipRect.width
  if (top + tooltipRect.height > viewportHeight)
    top = viewportHeight - tooltipRect.height

  tooltipStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
  }
}

let showTimer: number | null = null
let hideTimer: number | null = null

// 显示tooltip
function showTooltip() {
  if (props.disabled)
    return

  isMouseInTrigger = true

  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  showTimer = window.setTimeout(() => {
    isVisible.value = true
    nextTick(() => {
      calculatePosition()
      // 监听滚动和resize事件以更新位置
      window.addEventListener('scroll', calculatePosition, true)
      window.addEventListener('resize', calculatePosition)

      // 如果enterable为true，为tooltip添加鼠标事件
      if (props.enterable && tooltipRef.value && props.trigger === 'hover') {
        tooltipRef.value.addEventListener('mouseenter', handleTooltipMouseEnter)
        tooltipRef.value.addEventListener('mouseleave', handleTooltipMouseLeave)
      }
    })
  }, props.delay)
}

// 处理鼠标进入tooltip
function handleTooltipMouseEnter() {
  isMouseInTooltip = true
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

// 处理鼠标离开tooltip
function handleTooltipMouseLeave() {
  isMouseInTooltip = false
  if (!isMouseInTrigger)
    hideTooltip()
}

// 隐藏tooltip
function hideTooltip() {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }

  // 如果enterable为true且鼠标在tooltip内，不隐藏
  if (props.enterable && isMouseInTooltip && props.trigger === 'hover')
    return

  isMouseInTrigger = false

  hideTimer = window.setTimeout(() => {
    isVisible.value = false
    isMouseInTooltip = false

    // 移除事件监听
    window.removeEventListener('scroll', calculatePosition, true)
    window.removeEventListener('resize', calculatePosition)

    // 移除tooltip鼠标事件
    if (tooltipRef.value) {
      tooltipRef.value.removeEventListener('mouseenter', handleTooltipMouseEnter)
      tooltipRef.value.removeEventListener('mouseleave', handleTooltipMouseLeave)
    }
  }, 100)
}

// 设置事件监听
function setupTrigger() {
  if (!triggerRef.value)
    return

  const trigger = props.trigger

  if (trigger === 'hover') {
    triggerRef.value.addEventListener('mouseenter', showTooltip)
    triggerRef.value.addEventListener('mouseleave', hideTooltip)
  }
  else if (trigger === 'click') {
    triggerRef.value.addEventListener('click', () => {
      if (isVisible.value) {
        hideTooltip()
      }
      else {
        showTooltip()
      }
    })
    // 点击外部区域关闭tooltip
    document.addEventListener('click', (e) => {
      if (isVisible.value && triggerRef.value && !triggerRef.value.contains(e.target as Node)) {
        hideTooltip()
      }
    })
  }
  else if (trigger === 'focus') {
    triggerRef.value.addEventListener('focus', showTooltip)
    triggerRef.value.addEventListener('blur', hideTooltip)
  }
}

// 组件挂载完成后设置事件监听
onMounted(() => {
  setupTrigger()
})

// 组件卸载前清除事件监听和定时器
onUnmounted(() => {
  if (triggerRef.value) {
    const trigger = props.trigger
    if (trigger === 'hover') {
      triggerRef.value.removeEventListener('mouseenter', showTooltip)
      triggerRef.value.removeEventListener('mouseleave', hideTooltip)
    }
  }

  if (tooltipRef.value) {
    tooltipRef.value.removeEventListener('mouseenter', handleTooltipMouseEnter)
    tooltipRef.value.removeEventListener('mouseleave', handleTooltipMouseLeave)
  }

  window.removeEventListener('scroll', calculatePosition, true)
  window.removeEventListener('resize', calculatePosition)

  if (showTimer)
    clearTimeout(showTimer)

  if (hideTimer)
    clearTimeout(hideTimer)
})
</script>

<template>
  <div class="pxd-tooltip relative inline-flex">
    <div ref="triggerRef" class="pxd-tooltip--trigger">
      <slot />
    </div>

    <Transition name="pxd-transition--fade">
      <div
        v-if="isVisible"
        ref="tooltipRef"
        class="pxd-tooltip--content isolate fixed z-10 px-3 py-2 text-gray-100 rounded-md text-[13px] break-words whitespace-pre-line"
        :class="{ 'show-arrow': showArrow }"
        :data-position="position"
        :style="computedTooltipStyles"
      >
        <slot name="content">
          {{ content }}
        </slot>
      </div>
    </Transition>
  </div>
</template>

<style lang="postcss">
.pxd-tooltip--content.show-arrow {
  --arrow-color: var(--color-gray-1000);

  &::after {
    content: '';
    position: absolute;
    border-style: solid;
  }

  &[data-position='top']::after,
  &[data-position='bottom']::after {
    left: 50%;
    transform: translateX(-50%);
  }

  &[data-position='left']::after,
  &[data-position='right']::after {
    top: 50%;
    transform: translateY(-50%);
  }

  &[data-position='top']::after {
    bottom: -5px;
    border-width: 6px 6px 0;
    border-color: var(--arrow-color) transparent transparent;
  }

  &[data-position='bottom']::after {
    top: -5px;
    border-width: 0 6px 6px;
    border-color: transparent transparent var(--arrow-color);
  }

  &[data-position='left']::after {
    right: -5px;
    border-width: 6px 0 6px 6px;
    border-color: transparent transparent transparent var(--arrow-color);
  }

  &[data-position='right']::after {
    left: -5px;
    border-width: 6px 6px 6px 0;
    border-color: transparent var(--arrow-color) transparent transparent;
  }
}
</style>
