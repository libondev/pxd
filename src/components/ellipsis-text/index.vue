<script lang="ts" setup>
import type { EllipsisTextProps, EllipsisTextEmits } from './types'
import { twMerge } from 'tailwind-merge'
import { shallowRef, computed, nextTick, watch } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { getStyle } from '../../utils/dom'
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
const isTruncated = shallowRef(false)
const ellipsisText = shallowRef(props.text)

const textRef = shallowRef<HTMLElement>()
const actionRef = shallowRef<HTMLElement>()
const containerRef = shallowRef<HTMLElement>()

const maxRows = computed(() => {
  const rows = Number(props.rows ?? 1)
  return Number.isFinite(rows) && rows > 0 ? Math.floor(rows) : 1
})

const computedActionClass = computed(() => {
  return twMerge(
    'pxd-ellipsis-text--action cursor-pointer whitespace-nowrap text-blue-900',
    props.actionClass,
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

const TEXT_STYLE_KEYS: Array<keyof CSSStyleDeclaration> = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'fontVariant',
  'letterSpacing',
  'lineHeight',
  'textTransform',
  'textRendering',
  'wordSpacing',
]

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

function applyTextStyles(style: CSSStyleDeclaration, target: HTMLElement) {
  TEXT_STYLE_KEYS.forEach((key) => {
    target.style.setProperty(
      (key as string).replace(/[A-Z]/g, (m: string) => `-${m.toLowerCase()}`),
      style[key] as string,
    )
  })
  target.style.display = 'inline'
  target.style.whiteSpace = 'pre-wrap'
  target.style.wordBreak = 'break-word'
}

function buildCandidate(
  chars: string[],
  keep: number,
  dots: string,
  position: EllipsisTextProps['position'],
) {
  if (keep <= 0) {
    return dots
  }

  if (position === 'start') {
    return `${dots}${chars.slice(chars.length - keep).join('')}`
  }

  if (position === 'middle') {
    const headLen = Math.ceil(keep / 2)
    const tailLen = keep - headLen
    const head = chars.slice(0, headLen).join('')
    const tail = chars.slice(chars.length - tailLen).join('')

    return `${head}${dots}${tail}`
  }

  return `${chars.slice(0, keep).join('')}${dots}`
}

interface MeasureElements {
  container: HTMLSpanElement
  text: HTMLSpanElement
  action: HTMLSpanElement
}

function createMeasureElements(parent: HTMLElement): MeasureElements {
  const mc = document.createElement('span')
  const mt = document.createElement('span')
  const ma = document.createElement('span')

  mc.append(mt, ma)
  mc.style.position = 'absolute'
  mc.style.visibility = 'hidden'
  mc.style.pointerEvents = 'none'
  mc.style.zIndex = '-1'
  mc.style.left = '0'
  mc.style.top = '0'
  mc.style.overflow = 'visible'
  mc.style.whiteSpace = 'pre-wrap'
  mc.style.wordBreak = 'break-word'
  mc.style.display = 'block'
  mc.style.boxSizing = 'border-box'

  parent.appendChild(mc)

  return { container: mc, text: mt, action: ma }
}

function syncMeasureStyles(
  elements: MeasureElements,
  container: HTMLElement,
  textEl: HTMLElement | undefined,
  actionEl: HTMLElement | undefined,
) {
  const containerStyle = getStyle(container)
  const paddingLeft = parseSize(containerStyle.paddingLeft)
  const paddingRight = parseSize(containerStyle.paddingRight)
  const availableWidth = Math.max(0, container.clientWidth - paddingLeft - paddingRight)

  elements.container.style.width = `${availableWidth}px`

  const textStyle = getStyle(textEl ?? container)
  applyTextStyles(textStyle, elements.text)

  const actionStyle = actionEl ? getStyle(actionEl) : textStyle
  applyTextStyles(actionStyle, elements.action)
}

function fits(elements: MeasureElements, text: string, actionText: string, maxHeight: number) {
  elements.text.textContent = text

  if (actionText) {
    elements.action.textContent = actionText
    elements.action.style.display = 'inline'
  } else {
    elements.action.textContent = ''
    elements.action.style.display = 'none'
  }

  const height = elements.container.offsetHeight

  return height <= maxHeight + 0.5
}

async function updateEllipsis() {
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
    isTruncated.value = false
    return
  }

  if (isExpanded.value || !sourceText) {
    ellipsisText.value = sourceText
    return
  }

  const style = getStyle(textRef.value ?? container)
  const lineHeight = getLineHeightPx(style)
  const maxHeight = lineHeight * maxRows.value

  if (maxHeight <= 0) {
    ellipsisText.value = sourceText
    isTruncated.value = false
    return
  }

  const elements = createMeasureElements(container)

  try {
    syncMeasureStyles(elements, container, textRef.value, actionRef.value)

    if (fits(elements, sourceText, '', maxHeight)) {
      ellipsisText.value = sourceText
      isTruncated.value = false
      return
    }

    isTruncated.value = true

    const actionText = props.action ? props.moreText : ''

    const chars = [...sourceText]
    const dots = props.dots ?? ''
    let low = 0
    let high = chars.length
    let best = ''

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const candidate = buildCandidate(chars, mid, dots, props.position)

      if (fits(elements, candidate, actionText, maxHeight)) {
        best = candidate
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    ellipsisText.value = best || dots
  } finally {
    elements.container.remove()
  }
}

watch(
  () => props,
  () => {
    if (!props.action && isExpanded.value) {
      isExpanded.value = false
    }

    updateEllipsis()
  },
  {
    immediate: true,
    flush: 'post',
    deep: true,
  },
)

useResizeObserver(containerRef, updateEllipsis)

defineExpose({
  isExpanded,
  isTruncated,
})
</script>

<template>
  <div class="pxd-ellipsis-text" ref="containerRef" v-bind="$attrs">
    <span ref="textRef" class="pxd-ellipsis-text--text">{{ displayText.content }}</span>

    <span
      v-if="action && (isTruncated || isExpanded)"
      ref="actionRef"
      :class="computedActionClass"
      @click="toggleAction"
    >
      {{ displayText.action }}
    </span>
  </div>
</template>
