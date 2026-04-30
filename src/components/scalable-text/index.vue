<script lang="ts" setup>
import type { ScalableTextProps } from './types'
import { prepareWithSegments, measureNaturalWidth } from '@chenglou/pretext'
import { shallowRef, computed, watch, nextTick } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { getStyle } from '../../utils/dom'
import { isServer } from '../../utils/is'

defineOptions({
  name: 'PScalableText',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ScalableTextProps>(), {
  minFontSize: 12,
})

const PRECISION = 0.5

const needsWrap = shallowRef(false)
const containerRef = shallowRef<HTMLElement>()
const fittedFontSize = shallowRef<number | null>(null)
let rafId = 0
let pendingAdjust = false

function parseSize(value: string): number {
  return Number.parseFloat(value) || 0
}

function buildFont(style: CSSStyleDeclaration, sizePx: number): string {
  const fontStyle = style.fontStyle || 'normal'
  const fontWeight = style.fontWeight || '400'
  const fontFamily = style.fontFamily || 'sans-serif'
  return `${fontStyle} ${fontWeight} ${sizePx}px ${fontFamily}`
}

function measureWidth(text: string, font: string): number {
  return measureNaturalWidth(prepareWithSegments(text, font))
}

function adjust() {
  if (isServer()) {
    return
  }

  const el = containerRef.value
  if (!el?.isConnected) {
    return
  }

  const text = props.text ?? ''
  if (!text) {
    fittedFontSize.value = null
    needsWrap.value = false
    return
  }

  // Temporarily remove inline font-size to read the CSS-computed value
  const saved = el.style.fontSize
  el.style.fontSize = ''
  const style = getStyle(el)
  const defaultSize = parseSize(style.fontSize)
  el.style.fontSize = saved

  if (defaultSize <= 0) {
    return
  }

  const padLeft = parseSize(style.paddingLeft)
  const padRight = parseSize(style.paddingRight)
  const available = el.clientWidth - padLeft - padRight

  if (available <= 0) {
    return
  }

  const min = Math.max(0, props.minFontSize)

  // Measure at default size first
  const defaultWidth = measureWidth(text, buildFont(style, defaultSize))

  // Text fits at default size — no adjustment needed
  if (defaultWidth <= available) {
    fittedFontSize.value = null
    needsWrap.value = false
    return
  }

  // Check if even minFontSize still overflows
  const minWidth = measureWidth(text, buildFont(style, min))
  if (minWidth > available) {
    fittedFontSize.value = min
    needsWrap.value = true
    return
  }

  // Seed from previous result when available for faster convergence on resize
  const prevFit = fittedFontSize.value
  const seed =
    prevFit !== null && prevFit > min && prevFit < defaultSize
      ? prevFit
      : (available / defaultWidth) * defaultSize
  const clampedEst = Math.max(min, Math.min(defaultSize, seed))
  const estWidth = measureWidth(text, buildFont(style, clampedEst))

  let best: number
  if (estWidth <= available) {
    best = clampedEst
    let lo = clampedEst
    let hi = Math.min(defaultSize, clampedEst + PRECISION * 4)
    while (hi - lo > PRECISION) {
      const mid = (lo + hi) / 2
      if (measureWidth(text, buildFont(style, mid)) <= available) {
        best = mid
        lo = mid
      } else {
        hi = mid
      }
    }
  } else {
    best = min
    let lo = min
    let hi = clampedEst
    while (hi - lo > PRECISION) {
      const mid = (lo + hi) / 2
      if (measureWidth(text, buildFont(style, mid)) <= available) {
        best = mid
        lo = mid
      } else {
        hi = mid
      }
    }
  }

  fittedFontSize.value = best
  needsWrap.value = false
}

function scheduleAdjust() {
  if (pendingAdjust) {
    return
  }
  pendingAdjust = true
  // Use rAF to coalesce rapid resize events into a single frame
  rafId = requestAnimationFrame(() => {
    pendingAdjust = false
    nextTick(adjust)
  })
}

const computedStyle = computed(() => {
  const size = fittedFontSize.value
  if (size === null) {
    return undefined
  }
  return { fontSize: `${size}px` } as Record<string, string>
})

// Watch only the specific props that matter, no deep traversal
watch(() => [props.text, props.minFontSize], scheduleAdjust, { flush: 'post' })

useResizeObserver(containerRef, scheduleAdjust)

defineExpose({
  fittedFontSize,
  needsWrap,
})
</script>

<template>
  <div
    ref="containerRef"
    class="pxd-scalable-text max-w-full"
    :style="computedStyle"
    v-bind="$attrs"
  >
    {{ text }}
  </div>
</template>
