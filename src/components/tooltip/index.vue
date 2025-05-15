<script lang="ts" setup>
import type { ComponentVariant } from '../../types/components'
import { computed, nextTick, onMounted, onUnmounted, shallowRef } from 'vue'
import { useIntersectionObserver } from '../../composables/useIntersectionObserver'
import { useResizeObserver } from '../../composables/useResizeObserver'
import { throttle } from '../../utils/fn'

interface Props {
  width?: string
  content?: string
  showDelay?: number
  hideDelay?: number
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
    showDelay: 200,
    hideDelay: 100,
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

interface TooltipStyle {
  left: string
  top: string
}

const isVisible = shallowRef(false)
const tooltipRef = shallowRef<HTMLElement>()
const triggerRef = shallowRef<HTMLElement>()
const tooltipStyle = shallowRef({} as TooltipStyle)

const throttledCalculatePosition = throttle(calculatePosition, 1000 / 60) // 16.6667

const resizeObserver = useResizeObserver(null, throttledCalculatePosition)
const intersectionObserver = useIntersectionObserver(null, throttledCalculatePosition)

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

  // ensure tooltip is in viewport
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

let documentClickHandler: ((e: MouseEvent) => void) | null = null

function setupTrigger() {
  if (!triggerRef.value)
    return

  const trigger = props.trigger

  if (trigger === 'hover') {
    triggerRef.value.addEventListener('mouseenter', showTooltip)
    triggerRef.value.addEventListener('mouseleave', hideTooltip)
  } else if (trigger === 'focus') {
    triggerRef.value.addEventListener('focus', showTooltip)
    triggerRef.value.addEventListener('blur', hideTooltip)
  } else if (trigger === 'click') {
    triggerRef.value.addEventListener('click', () => {
      if (isVisible.value) {
        hideTooltip()
      } else {
        showTooltip()
      }
    })

    documentClickHandler = (e: MouseEvent) => {
      if (isVisible.value && triggerRef.value && !triggerRef.value.contains(e.target as Node)) {
        hideTooltip()
      }
    }

    document.addEventListener('click', documentClickHandler)
  }
}

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
      calculatePosition() // first time calculate without throttle

      resizeObserver.observer?.observe(triggerRef.value!)
      intersectionObserver.observer?.observe(triggerRef.value!)

      if (props.enterable && tooltipRef.value && props.trigger === 'hover') {
        tooltipRef.value.addEventListener('mouseenter', onTooltipMouseEnter)
        tooltipRef.value.addEventListener('mouseleave', onTooltipMouseLeave)
      }
    })
  }, props.showDelay)
}

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
    resizeObserver.observer?.unobserve(triggerRef.value!)
    intersectionObserver.observer?.unobserve(triggerRef.value!)

    // 移除tooltip鼠标事件
    if (tooltipRef.value) {
      tooltipRef.value.removeEventListener('mouseenter', onTooltipMouseEnter)
      tooltipRef.value.removeEventListener('mouseleave', onTooltipMouseLeave)
    }
  }, props.hideDelay)
}

function onTooltipMouseEnter() {
  isMouseInTooltip = true
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function onTooltipMouseLeave() {
  isMouseInTooltip = false

  if (!isMouseInTrigger) {
    hideTooltip()
  }
}

function unbindEvents() {
  if (triggerRef.value) {
    const trigger = props.trigger
    if (trigger === 'hover') {
      triggerRef.value.removeEventListener('mouseenter', showTooltip)
      triggerRef.value.removeEventListener('mouseleave', hideTooltip)
    } else if (trigger === 'focus') {
      triggerRef.value.removeEventListener('focus', showTooltip)
      triggerRef.value.removeEventListener('blur', hideTooltip)
    } else if (trigger === 'click') {
      triggerRef.value.removeEventListener('click', showTooltip)
    }
  }

  if (documentClickHandler) {
    document.removeEventListener('click', documentClickHandler)
  }

  if (tooltipRef.value) {
    tooltipRef.value.removeEventListener('mouseenter', onTooltipMouseEnter)
    tooltipRef.value.removeEventListener('mouseleave', onTooltipMouseLeave)
  }

  window.removeEventListener('scroll', throttledCalculatePosition, true)
  window.removeEventListener('resize', throttledCalculatePosition)
}

function cleanupTimer() {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }

  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

onMounted(() => {
  setupTrigger()
})

onUnmounted(() => {
  unbindEvents()
  cleanupTimer()
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
