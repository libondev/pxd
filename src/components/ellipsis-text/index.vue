<script lang="ts" setup>
import type { EllipsisTextProps, EllipsisTextEmits } from './types'
import type { RichInlineItem } from '@chenglou/pretext/rich-inline'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import { prepareRichInline, measureRichInlineStats } from '@chenglou/pretext/rich-inline'
import { cn } from 'cn'
import { shallowRef, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { getStyle } from '../../utils/dom'
import { scheduleByRaf } from '../../utils/event'
import { isServer } from '../../utils/is'

defineOptions({
  name: 'PEllipsisText',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<EllipsisTextProps>(), {
  rows: 1,
  dots: '...',
  position: 'end',
  moreText: 'Expand',
  lessText: 'Collapse',
})

const emits = defineEmits<EllipsisTextEmits>()

const isExpanded = shallowRef(false)
const isOverflow = shallowRef(false)
const ellipsisText = shallowRef(props.text)

const textRef = shallowRef<HTMLElement>()
const actionRef = shallowRef<HTMLElement>()
const containerRef = shallowRef<HTMLElement>()

const maxRows = computed(() => {
  const rows = Number(props.rows ?? 1)
  return Number.isFinite(rows) && rows > 0 ? Math.floor(rows) : 1
})

const computedActionClass = computed(() => {
  return cn(
    'pxd-ellipsis-text--action cursor-pointer whitespace-nowrap text-blue-900',
    isExpanded.value ? props.lessActionClass : props.moreActionClass,
  )
})

const displayText = computed(() => {
  if (isExpanded.value) {
    return {
      content: props.text,
      action: props.lessText,
    }
  }

  return {
    content: ellipsisText.value,
    action: props.moreText,
  }
})

function toggleAction() {
  if (!props.action) {
    return
  }

  isExpanded.value = !isExpanded.value
  emits('toggle', isExpanded.value)
  updateEllipsis()
}

function parseSize(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function getLineHeightPx(style: CSSStyleDeclaration) {
  const lineHeight = style.lineHeight
  const fontSize = parseSize(style.fontSize)
  if (!lineHeight || lineHeight === 'normal') {
    return fontSize > 0 ? fontSize * 1.2 : 19.2
  }

  const parsed = parseSize(lineHeight)
  if (parsed <= 0) {
    return fontSize > 0 ? fontSize * 1.2 : 19.2
  }

  return parsed
}

function getFontShorthand(style: CSSStyleDeclaration) {
  const fontStyle = style.fontStyle || 'normal'
  const fontWeight = style.fontWeight || '400'
  const fontSize = style.fontSize || '16px'
  const fontFamily = style.fontFamily || 'sans-serif'
  return `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`
}

function getAvailableWidth(container: HTMLElement) {
  const containerStyle = getStyle(container)
  const paddingLeft = parseSize(containerStyle.paddingLeft)
  const paddingRight = parseSize(containerStyle.paddingRight)
  return Math.max(0, container.clientWidth - paddingLeft - paddingRight)
}

function measureLineCount(
  text: string,
  textFont: string,
  maxWidth: number,
  actionText?: string,
  actionFont?: string,
) {
  const items: RichInlineItem[] = [{ text, font: textFont }]
  if (actionText) {
    items.push({ text: actionText, font: actionFont || textFont, break: 'never' })
  }
  return measureRichInlineStats(prepareRichInline(items), maxWidth).lineCount
}

function joinChars(chars: string[], start: number, end: number) {
  return chars.slice(start, end).join('')
}

function buildCandidate(chars: string[], keep: number, dots: string, position: 'start' | 'middle') {
  if (keep <= 0) {
    return dots
  }

  if (position === 'start') {
    return `${dots}${joinChars(chars, chars.length - keep, chars.length)}`
  }

  const headLen = Math.ceil(keep / 2)
  const tailLen = keep - headLen
  return `${joinChars(chars, 0, headLen)}${dots}${joinChars(chars, chars.length - tailLen, chars.length)}`
}

const updateEllipsis = scheduleByRaf(async () => {
  if (isServer()) {
    return
  }

  const container = containerRef.value

  if (!container || !container.isConnected) {
    return
  }

  await nextTick()

  const sourceText = props.text ?? ''

  if (container.clientWidth <= 0) {
    ellipsisText.value = sourceText
    isOverflow.value = false
    return
  }

  if (isExpanded.value || !sourceText) {
    ellipsisText.value = sourceText
    return
  }

  const style = getStyle(textRef.value ?? container)
  const lineHeight = getLineHeightPx(style)

  if (lineHeight <= 0) {
    ellipsisText.value = sourceText
    isOverflow.value = false
    return
  }

  const availableWidth = getAvailableWidth(container)
  const textFont = getFontShorthand(style)

  if (measureLineCount(sourceText, textFont, availableWidth) <= maxRows.value) {
    ellipsisText.value = sourceText
    isOverflow.value = false
    return
  }

  isOverflow.value = true

  const actionText = props.action ? props.moreText : ''
  const actionFont = actionRef.value ? getFontShorthand(getStyle(actionRef.value)) : textFont
  const dots = props.dots ?? ''

  if (props.position === 'end') {
    const prepared = prepareWithSegments(sourceText, textFont)
    const { lines } = layoutWithLines(prepared, availableWidth, lineHeight)
    const baseText = lines
      .slice(0, maxRows.value)
      .map((l) => l.text)
      .join('')
    const baseChars = [...baseText]

    let low = 0
    let high = baseChars.length
    let best = ''

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const candidate = `${joinChars(baseChars, 0, mid)}${dots}`

      if (
        measureLineCount(candidate, textFont, availableWidth, actionText, actionFont) <=
        maxRows.value
      ) {
        best = candidate
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    ellipsisText.value = best || dots
    return
  }

  const chars = [...sourceText]
  let low = 0
  let high = chars.length
  let best = ''

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const candidate = buildCandidate(chars, mid, dots, props.position)

    if (
      measureLineCount(candidate, textFont, availableWidth, actionText, actionFont) <= maxRows.value
    ) {
      best = candidate
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  ellipsisText.value = best || dots
})

watch(
  () => [
    props.text,
    props.rows,
    props.dots,
    props.position,
    props.action,
    props.moreText,
    props.moreActionClass,
  ],
  () => {
    if (!props.action && isExpanded.value) {
      isExpanded.value = false
    }

    updateEllipsis()
  },
  {
    immediate: true,
    flush: 'post',
  },
)

useResizeObserver(containerRef, updateEllipsis)

onBeforeUnmount(() => {
  updateEllipsis.cancel()
})

defineExpose({
  isExpanded,
  isOverflow,
})
</script>

<template>
  <div class="pxd-ellipsis-text" ref="containerRef" v-bind="$attrs">
    <span ref="textRef" class="pxd-ellipsis-text--text">{{ displayText.content }}</span>

    <span
      v-if="action && (isOverflow || isExpanded)"
      ref="actionRef"
      :class="computedActionClass"
      @click="toggleAction"
    >
      {{ displayText.action }}
    </span>
  </div>
</template>
