<script lang="ts" setup>
import type { MarchingAntsProps } from './types'
import type { ComponentPublicInstance } from 'vue'
import { computed, shallowRef } from 'vue'
import { getElement } from '../../utils/dom'
import { getCssUnitValue } from '../../utils/format'

interface EllipseOutline {
  type: 'ellipse'
  cx: number
  cy: number
  rx: number
  ry: number
  width: number
  height: number
}

interface PathOutline {
  type: 'path'
  d: string
  width: number
  height: number
}

type Outline = EllipseOutline | PathOutline

interface Point {
  x: number
  y: number
}

interface ElementRect {
  style: CSSStyleDeclaration
  width: number
  height: number
}

interface WebkitStyleDeclaration {
  webkitClipPath?: string
  webkitMaskImage?: string
}

interface ClipBoundary {
  contains: (point: Point) => boolean
  intersect: (from: Point, to: Point) => Point
}

const resolveLength = (value: string, reference: number) =>
  value.endsWith('%') ? (parseFloat(value) / 100) * reference : parseFloat(value)

const getElementRect = (element: HTMLElement): ElementRect => ({
  style: getComputedStyle(element),
  width: element.offsetWidth,
  height: element.offsetHeight,
})

const createEllipseOutline = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  width: number,
  height: number,
): EllipseOutline => ({ type: 'ellipse', cx, cy, rx, ry, width, height })

const createPathOutline = (d: string, width: number, height: number): PathOutline => ({
  type: 'path',
  d,
  width,
  height,
})

const createRectangleOutline = (width: number, height: number) =>
  createPathOutline(`M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`, width, height)

function ellipseRectIntersect(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  width: number,
  height: number,
): Outline {
  if (cx - rx >= 0 && cx + rx <= width && cy - ry >= 0 && cy + ry <= height) {
    return createEllipseOutline(cx, cy, rx, ry, width, height)
  }

  const sampleCount = 720
  const rawPoints: Point[] = []
  for (let index = 0; index < sampleCount; index++) {
    const angle = (index / sampleCount) * Math.PI * 2
    rawPoints.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) })
  }

  const boundaries: ClipBoundary[] = [
    {
      contains: (point) => point.x >= 0,
      intersect: (from, to) => {
        const progress = -from.x / (to.x - from.x)
        return { x: 0, y: from.y + progress * (to.y - from.y) }
      },
    },
    {
      contains: (point) => point.x <= width,
      intersect: (from, to) => {
        const progress = (width - from.x) / (to.x - from.x)
        return { x: width, y: from.y + progress * (to.y - from.y) }
      },
    },
    {
      contains: (point) => point.y >= 0,
      intersect: (from, to) => {
        const progress = -from.y / (to.y - from.y)
        return { x: from.x + progress * (to.x - from.x), y: 0 }
      },
    },
    {
      contains: (point) => point.y <= height,
      intersect: (from, to) => {
        const progress = (height - from.y) / (to.y - from.y)
        return { x: from.x + progress * (to.x - from.x), y: height }
      },
    },
  ]

  let points = rawPoints
  for (const { contains, intersect } of boundaries) {
    const input = points
    points = []
    for (let index = 0; index < input.length; index++) {
      const current = input[index]
      const previous = input[(index - 1 + input.length) % input.length]
      const currentInside = contains(current)
      const previousInside = contains(previous)

      if (previousInside && currentInside) {
        points.push(current)
      } else if (previousInside) {
        points.push(intersect(previous, current))
      } else if (currentInside) {
        points.push(intersect(previous, current), current)
      }
    }

    if (!points.length) {
      break
    }
  }

  if (points.length < 3) {
    return createRectangleOutline(width, height)
  }

  const uniquePoints = [points[0]]
  for (let index = 1; index < points.length; index++) {
    const previous = uniquePoints[uniquePoints.length - 1]
    const current = points[index]
    if ((current.x - previous.x) ** 2 + (current.y - previous.y) ** 2 > 0.01) {
      uniquePoints.push(current)
    }
  }

  const isOnEdge = (point: Point) =>
    point.x < 0.5 || point.x > width - 0.5 || point.y < 0.5 || point.y > height - 0.5
  const format = (value: number) => value.toFixed(2)
  const count = uniquePoints.length
  let d = `M ${format(uniquePoints[0].x)} ${format(uniquePoints[0].y)}`

  for (let index = 0; index < count; index++) {
    const current = uniquePoints[index]
    const next = uniquePoints[(index + 1) % count]
    if (isOnEdge(current) && isOnEdge(next)) {
      d += ` L ${format(next.x)} ${format(next.y)}`
      continue
    }

    const previous = uniquePoints[(index - 1 + count) % count]
    const afterNext = uniquePoints[(index + 2) % count]
    const tension = 6
    d += ` C ${format(current.x + (next.x - previous.x) / tension)},${format(
      current.y + (next.y - previous.y) / tension,
    )} ${format(next.x - (afterNext.x - current.x) / tension)},${format(
      next.y - (afterNext.y - current.y) / tension,
    )} ${format(next.x)},${format(next.y)}`
  }

  return createPathOutline(`${d} Z`, width, height)
}

function parseBorderRadius({ style, width, height }: ElementRect): PathOutline | EllipseOutline {
  const radii = (
    [
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomRightRadius',
      'borderBottomLeftRadius',
    ] as const
  ).map((property) => {
    const values = style[property].split(/\s+/)
    return {
      rx: resolveLength(values[0], width),
      ry: resolveLength(values[1] || values[0], height),
    }
  })
  const [topLeft, topRight, bottomRight, bottomLeft] = radii

  if (
    [topLeft, topRight, bottomRight, bottomLeft].every(
      (radius) => Math.abs(radius.rx - width / 2) < 1 && Math.abs(radius.ry - height / 2) < 1,
    )
  ) {
    return createEllipseOutline(width / 2, height / 2, width / 2 - 1, height / 2 - 1, width, height)
  }

  const offset = 1
  const arc = (radius: { rx: number; ry: number }, x: number, y: number) =>
    radius.rx > 0 || radius.ry > 0
      ? `A ${Math.max(0, radius.rx - offset)} ${Math.max(0, radius.ry - offset)} 0 0 1 ${x} ${y}`
      : `L ${x} ${y}`

  return createPathOutline(
    [
      `M ${topLeft.rx + offset} ${offset}`,
      `L ${width - topRight.rx - offset} ${offset}`,
      arc(topRight, width - offset, topRight.ry + offset),
      `L ${width - offset} ${height - bottomRight.ry - offset}`,
      arc(bottomRight, width - bottomRight.rx - offset, height - offset),
      `L ${bottomLeft.rx + offset} ${height - offset}`,
      arc(bottomLeft, offset, height - bottomLeft.ry - offset),
      `L ${offset} ${topLeft.ry + offset}`,
      arc(topLeft, topLeft.rx + offset, offset),
      'Z',
    ].join(' '),
    width,
    height,
  )
}

function parseClipPath({ style, width, height }: ElementRect): Outline | null {
  const webkitStyle = style as CSSStyleDeclaration & WebkitStyleDeclaration
  const clipPath = style.clipPath || webkitStyle.webkitClipPath || 'none'
  if (clipPath === 'none') {
    return null
  }

  let match = clipPath.match(/polygon\(([^)]+)\)/)
  if (match) {
    const points = match[1].split(',').map((point) => {
      const [x, y] = point.trim().split(/\s+/)
      return { x: resolveLength(x, width), y: resolveLength(y, height) }
    })
    if (points.length < 3) {
      return null
    }

    return createPathOutline(
      `${points
        .map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
        .join(' ')} Z`,
      width,
      height,
    )
  }

  match = clipPath.match(/circle\(([^)]+)\)/)
  if (match) {
    const parts = match[1].split(/\s+at\s+/)
    if (parts.length === 2) {
      const radius = resolveLength(parts[0].trim(), Math.min(width, height))
      const [x, y] = parts[1].trim().split(/\s+/)
      return createEllipseOutline(
        resolveLength(x, width),
        resolveLength(y, height),
        radius,
        radius,
        width,
        height,
      )
    }

    const radius = Math.min(width, height) / 2
    return createEllipseOutline(width / 2, height / 2, radius, radius, width, height)
  }

  match = clipPath.match(/ellipse\(([^)]*)\)/)
  if (match) {
    const parts = match[1].split(/\s+at\s+/)
    const position = parts[1]?.trim().split(/\s+/) || ['50%', '50%']
    const cx = resolveLength(position[0] || '50%', width)
    const cy = resolveLength(position[1] || '50%', height)
    const [rxValue, ryValue] = (parts[0] || '').trim().split(/\s+/).filter(Boolean)
    const rx = rxValue ? resolveLength(rxValue, width) : Math.min(cx, width - cx)
    const ry = ryValue ? resolveLength(ryValue, height) : Math.min(cy, height - cy)

    return createEllipseOutline(cx, cy, rx, ry, width, height)
  }

  match = clipPath.match(/inset\(([^)]+)\)/)
  if (match) {
    const [insetPart, radiusPart] = match[1].split(/\s+round\s+/)
    const insets = insetPart
      .trim()
      .split(/\s+/)
      .map((value, index) => resolveLength(value, index % 2 === 0 ? height : width))
    const top = insets[0] || 0
    const right = insets[1] ?? top
    const bottom = insets[2] ?? top
    const left = insets[3] ?? right
    const insetWidth = width - left - right
    const insetHeight = height - top - bottom

    if (radiusPart) {
      const radius = parseFloat(radiusPart.trim().split(/\s+/)[0]) || 0
      return createPathOutline(
        [
          `M ${left + radius} ${top}`,
          `L ${left + insetWidth - radius} ${top}`,
          `A ${radius} ${radius} 0 0 1 ${left + insetWidth} ${top + radius}`,
          `L ${left + insetWidth} ${top + insetHeight - radius}`,
          `A ${radius} ${radius} 0 0 1 ${left + insetWidth - radius} ${top + insetHeight}`,
          `L ${left + radius} ${top + insetHeight}`,
          `A ${radius} ${radius} 0 0 1 ${left} ${top + insetHeight - radius}`,
          `L ${left} ${top + radius}`,
          `A ${radius} ${radius} 0 0 1 ${left + radius} ${top}`,
          'Z',
        ].join(' '),
        width,
        height,
      )
    }

    return createPathOutline(
      `M ${left} ${top} L ${left + insetWidth} ${top} L ${left + insetWidth} ${top + insetHeight} L ${left} ${top + insetHeight} Z`,
      width,
      height,
    )
  }

  return null
}

function parseMaskImage({ style, width, height }: ElementRect): Outline | null {
  const webkitStyle = style as CSSStyleDeclaration & WebkitStyleDeclaration
  const maskImage = style.maskImage || webkitStyle.webkitMaskImage || 'none'
  if (maskImage === 'none') {
    return null
  }

  const radialGradient = maskImage.match(/radial-gradient\((.+)\)/)
  if (!radialGradient) {
    return null
  }

  const tokens: string[] = []
  let depth = 0
  let token = ''
  for (const character of radialGradient[1]) {
    if (character === '(') {
      depth++
    } else if (character === ')') {
      depth--
    }

    if (character === ',' && !depth) {
      tokens.push(token)
      token = ''
    } else {
      token += character
    }
  }
  if (token) {
    tokens.push(token)
  }

  let shape = 'ellipse'
  let sizeKeyword = 'farthest-corner'
  let cx = width / 2
  let cy = height / 2
  let explicitRx: number | null = null
  let explicitRy: number | null = null
  let colorStartIndex = 0
  const firstToken = tokens[0].trim()
  const isColorStop = (value: string) => /^(rgb|hsl|#|transparent|black|white)/i.test(value.trim())

  if (!isColorStop(firstToken)) {
    colorStartIndex = 1
    if (firstToken.includes('circle')) {
      shape = 'circle'
    }

    for (const keyword of ['closest-side', 'closest-corner', 'farthest-side', 'farthest-corner']) {
      if (firstToken.includes(keyword)) {
        sizeKeyword = keyword
        break
      }
    }

    const beforePosition = firstToken.split(/\s+at\s+/)[0]
    const sizeTokens = beforePosition
      .replace(/circle|ellipse/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    if (sizeTokens.length >= 1 && /[\d.]/.test(sizeTokens[0])) {
      explicitRx = resolveLength(sizeTokens[0], width)
      explicitRy =
        sizeTokens.length >= 2 && /[\d.]/.test(sizeTokens[1])
          ? resolveLength(sizeTokens[1], height)
          : explicitRx
    }

    const positionMatch = firstToken.match(/at\s+(.+)/)
    if (positionMatch) {
      const positionTokens = positionMatch[1].trim().split(/\s+/)
      const resolvePosition = (value: string, reference: number) => {
        const positions: Record<string, number> = {
          center: reference / 2,
          left: 0,
          top: 0,
          right: reference,
          bottom: reference,
        }
        return positions[value] ?? resolveLength(value, reference)
      }
      cx = resolvePosition(positionTokens[0], width)
      cy = resolvePosition(positionTokens[1] || positionTokens[0], height)
    }
  }

  let rx: number
  let ry: number
  if (explicitRx !== null) {
    rx = explicitRx
    ry = explicitRy ?? explicitRx
  } else if (shape === 'circle') {
    const radiusByKeyword: Record<string, number> = {
      'farthest-corner': Math.sqrt(Math.max(cx, width - cx) ** 2 + Math.max(cy, height - cy) ** 2),
      'closest-corner': Math.sqrt(Math.min(cx, width - cx) ** 2 + Math.min(cy, height - cy) ** 2),
      'farthest-side': Math.max(cx, width - cx, cy, height - cy),
      'closest-side': Math.min(cx, width - cx, cy, height - cy),
    }
    rx = radiusByKeyword[sizeKeyword] || width / 2
    ry = rx
  } else {
    const radiusByKeyword: Record<string, [number, number]> = {
      'farthest-corner': [
        Math.max(cx, width - cx) * Math.SQRT2,
        Math.max(cy, height - cy) * Math.SQRT2,
      ],
      'farthest-side': [Math.max(cx, width - cx), Math.max(cy, height - cy)],
      'closest-side': [Math.min(cx, width - cx), Math.min(cy, height - cy)],
    }
    ;[rx, ry] = radiusByKeyword[sizeKeyword] || [width / 2, height / 2]
  }

  let boundaryPosition = 0.5
  for (let index = colorStartIndex; index < tokens.length - 1; index++) {
    const currentPosition = tokens[index].trim().match(/([\d.]+)(%|px)\s*$/)
    const nextPosition = tokens[index + 1].trim().match(/([\d.]+)(%|px)\s*$/)
    if (!currentPosition || !nextPosition) {
      continue
    }

    const currentColor = tokens[index].trim().slice(0, currentPosition.index).trim().toLowerCase()
    const nextColor = tokens[index + 1].trim().slice(0, nextPosition.index).trim().toLowerCase()
    const isTransparent = (color: string) =>
      color === 'transparent' || /rgba\([^)]*,\s*0\s*\)/.test(color)
    if (!isTransparent(currentColor) && isTransparent(nextColor)) {
      boundaryPosition =
        currentPosition[2] === '%'
          ? parseFloat(currentPosition[1]) / 100
          : parseFloat(currentPosition[1]) / rx
      break
    }
  }

  return ellipseRectIntersect(cx, cy, rx * boundaryPosition, ry * boundaryPosition, width, height)
}

function getOutline(element: HTMLElement): Outline {
  const elementRect = getElementRect(element)
  const outline = parseClipPath(elementRect) || parseMaskImage(elementRect)
  if (outline) {
    return outline
  }

  if (elementRect.style.borderRadius && elementRect.style.borderRadius !== '0px') {
    return parseBorderRadius(elementRect)
  }

  return createRectangleOutline(elementRect.width, elementRect.height)
}

defineOptions({
  name: 'PMarchingAnts',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MarchingAntsProps>(), {
  as: 'div',
  color: '#00ff88',
  lineSize: 2,
  dashSize: 8,
  gap: 4,
})

const targetRef = shallowRef<HTMLElement | ComponentPublicInstance>()
const outline = shallowRef<Outline>()

const dashArray = computed(() => {
  const dash = parseFloat(getCssUnitValue(props.dashSize, '8') || '8')
  const gap = parseFloat(getCssUnitValue(props.gap, '4') || '4')
  return { value: `${dash} ${gap}`, offset: `-${dash + gap}` }
})

const strokeStyle = computed(() => ({
  '--marching-ants-color': props.color,
  '--marching-ants-stroke-width': getCssUnitValue(props.lineSize, '2px'),
  '--marching-ants-dash-array': dashArray.value.value,
  '--marching-ants-dash-offset': dashArray.value.offset,
}))

const circleOutline = computed<EllipseOutline | undefined>(() => {
  const value = outline.value
  return value?.type === 'ellipse' && Math.abs(value.rx - value.ry) < 0.5 ? value : undefined
})

const ellipseOutline = computed<EllipseOutline | undefined>(() => {
  const value = outline.value
  return value?.type === 'ellipse' && !circleOutline.value ? value : undefined
})

const pathOutline = computed<PathOutline | undefined>(() =>
  outline.value?.type === 'path' ? outline.value : undefined,
)

function select() {
  const target = getElement(targetRef.value)
  if (!target) {
    return
  }

  outline.value = getOutline(target)
}

function deselect() {
  outline.value = undefined
}

defineExpose({
  select,
  deselect,
})
</script>

<template>
  <div class="pxd-marching-ants relative">
    <Component
      :is="as"
      ref="targetRef"
      class="pxd-marching-ants--target"
      v-bind="$attrs"
      @click="select"
    >
      <slot />
    </Component>

    <svg
      v-if="outline"
      aria-hidden="true"
      class="pxd-marching-ants--overlay inset-0 pointer-events-none absolute overflow-visible"
      :height="outline.height"
      :style="strokeStyle"
      :viewBox="`0 0 ${outline.width} ${outline.height}`"
      :width="outline.width"
    >
      <circle
        v-if="circleOutline"
        class="pxd-marching-ants--shape motion-reduce:animate-none!"
        :cx="circleOutline.cx"
        :cy="circleOutline.cy"
        :r="circleOutline.rx"
      />
      <ellipse
        v-else-if="ellipseOutline"
        class="pxd-marching-ants--shape motion-reduce:animate-none!"
        :cx="ellipseOutline.cx"
        :cy="ellipseOutline.cy"
        :rx="ellipseOutline.rx"
        :ry="ellipseOutline.ry"
      />
      <path
        v-else-if="pathOutline"
        class="pxd-marching-ants--shape motion-reduce:animate-none!"
        :d="pathOutline.d"
      />
    </svg>
  </div>
</template>

<style>
.pxd-marching-ants--shape {
  fill: none;
  stroke: var(--marching-ants-color);
  stroke-width: var(--marching-ants-stroke-width);
  stroke-dasharray: var(--marching-ants-dash-array);
  animation: pxd-animation-marching-ants 0.4s linear infinite;
}

@keyframes pxd-animation-marching-ants {
  to {
    stroke-dashoffset: var(--marching-ants-dash-offset);
  }
}
</style>
