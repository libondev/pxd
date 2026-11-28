<script lang="ts" setup>
import type {
  ImageCrop,
  ImageCropperCropChangeDetails,
  ImageCropperCropChangeReason,
  ImageCropperCropCommitDetails,
  ImageCropperEmits,
  ImageCropperFileOptions,
  ImageCropperFlipDirection,
  ImageCropperHandlePosition,
  ImageCropperNaturalSize,
  ImageCropperProps,
} from './types'
import ArrowLeftRightIcon from '@gdsicon/vue/arrow-left-right'
import ArrowUpDownIcon from '@gdsicon/vue/arrow-up-down'
import MagnifyingGlassMinusIcon from '@gdsicon/vue/magnifying-glass-minus'
import MagnifyingGlassPlusIcon from '@gdsicon/vue/magnifying-glass-plus'
import RotateClockwiseIcon from '@gdsicon/vue/rotate-clockwise'
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
} from 'vue'
import { notifyAgentChange } from '../../agent/report.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { cancelableChangeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { useResizeObserver } from '../../composables/use-resize-observer.js'
import {
  completeCrop,
  cropImageElement,
  fitCrop,
  flipCrop,
  initialCrop,
  largestSize,
  layoutOf,
  resizeCrop,
  rotateCrop,
  roundCrop,
  sameCrop,
  shownSize,
  smallestSize,
  zoomCrop,
  zoomOf,
  type ImageCropperCrop,
  type ImageCropperLimits,
  type ImageCropperRect,
  type ImageCropperResizeHandle,
} from '../../utils/_internal/image-cropper.js'
import { caf, raf } from '../../utils/event.js'
import PButton from '../button/index.vue'
import PCheckerboard from '../checkerboard/index.vue'
import PSpinner from '../spinner/index.vue'

interface ImageCropperChangeAt {
  reason: ImageCropperCropChangeReason
  event?: Event
}

interface ImageCropperDrag {
  pointerId: number
  handle: ImageCropperResizeHandle
  startX: number
  startY: number
  startCrop: ImageCropperCrop
  scale: number
  moved: boolean
}

interface ImageCropperFrameGesture {
  crop: ImageCropperCrop
  center: { x: number; y: number }
  distance: number
  zoom: number
  scale: number
  selection: ImageCropperRect
}

interface ImageCropperPointer {
  x: number
  y: number
}

defineOptions({
  name: 'PImageCropper',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ImageCropperProps>(), {
  alt: '',
  mode: 'box',
  shape: 'rectangle',
  minWidth: 1,
  minHeight: 1,
  maxZoom: 10,
})

const emits = defineEmits<ImageCropperEmits>()

const HANDLE_POSITIONS: readonly ImageCropperHandlePosition[] = [
  'nw',
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
]

const HANDLE_SPOTS: Record<ImageCropperHandlePosition, readonly [number, number]> = {
  n: [0.5, 0],
  e: [1, 0.5],
  s: [0.5, 1],
  w: [0, 0.5],
  ne: [1, 0],
  nw: [0, 0],
  se: [1, 1],
  sw: [0, 1],
}

const HANDLE_LABELS: Record<ImageCropperHandlePosition, string> = {
  n: 'Top edge',
  e: 'Right edge',
  s: 'Bottom edge',
  w: 'Left edge',
  ne: 'Top right corner',
  nw: 'Top left corner',
  se: 'Bottom right corner',
  sw: 'Bottom left corner',
}

const HANDLE_CURSORS: Record<ImageCropperHandlePosition, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
}

const ARROW_STEPS: Record<string, readonly [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
}

const WHEEL_COMMIT_DELAY = 300
const ZOOM_STEP = 1.25
const DRAG_LARGE_STEP = 10

let drag: ImageCropperDrag | null = null
let dragFrame = 0
let pendingDragEvent: PointerEvent | null = null
let cropForSrc: string | undefined = props.defaultCrop ? props.src : undefined
let wheelTimer: ReturnType<typeof setTimeout> | undefined
let wheelEvent: WheelEvent | undefined
let wheelCrop: ImageCropperCrop | null = null
const framePointers = new Map<number, ImageCropperPointer>()
let frameGesture: ImageCropperFrameGesture | null = null
let frameFrame = 0
let pendingFrameEvent: PointerEvent | null = null
let frameStartCrop: ImageCropperCrop | null = null
let frameMoved = false
let frameReason: 'drag' | 'pinch' = 'drag'
const instance = getCurrentInstance()

const rootRef = shallowRef<HTMLElement>()
const viewportRef = shallowRef<HTMLElement>()
const selectionRef = shallowRef<HTMLElement>()
const imageRef = shallowRef<HTMLImageElement>()
const innerCrop = shallowRef<ImageCropperCrop | null>(
  props.defaultCrop ? completeCrop(props.defaultCrop) : null,
)
const naturalSize = shallowRef<ImageCropperNaturalSize | null>(null)
const status = shallowRef<'loading' | 'loaded' | 'error'>('loading')
const viewportBox = shallowRef<ImageCropperRect>({ left: 0, top: 0, width: 0, height: 0 })
const dragging = shallowRef<ImageCropperResizeHandle | 'pan' | null>(null)

const isControlled = computed(() => props.crop !== undefined)
const activeCrop = computed<ImageCropperCrop | null>(() => {
  if (isControlled.value) {
    return props.crop ? completeCrop(props.crop) : null
  }

  return innerCrop.value
})
const limits = computed<ImageCropperLimits>(() => ({
  aspect: props.aspectRatio && props.aspectRatio > 0 ? props.aspectRatio : undefined,
  minWidth: Math.max(1, props.minWidth),
  minHeight: Math.max(1, props.minHeight),
  maxZoom: Math.max(1, props.maxZoom),
}))
const shown = computed(() =>
  naturalSize.value && activeCrop.value
    ? shownSize(naturalSize.value, activeCrop.value.rotation)
    : null,
)
const layout = computed(() => {
  const crop = activeCrop.value
  const size = naturalSize.value
  const box = viewportBox.value

  if (!crop || !size || !box.width || !box.height) {
    return null
  }

  return layoutOf(crop, size, box, props.mode, limits.value.aspect)
})
const zoom = computed(() =>
  activeCrop.value && naturalSize.value ? zoomOf(activeCrop.value, naturalSize.value) : 1,
)
const zoomLimit = computed(() => {
  const size = shown.value
  const crop = activeCrop.value

  if (!size || !crop) {
    return limits.value.maxZoom
  }

  const full = largestSize(size, limits.value.aspect)
  const least = smallestSize(size, limits.value)

  return Math.max(
    1,
    Math.min(limits.value.maxZoom, full.width / least.width, full.height / least.height),
  )
})
const zoomPercent = computed(() => `${Math.round(zoom.value * 100)}%`)
const isReady = computed(() => status.value === 'loaded')
const isInert = computed(() => props.disabled || !isReady.value)
const canZoomIn = computed(() => !isInert.value && zoom.value < zoomLimit.value - 0.001)
const canZoomOut = computed(() => !isInert.value && zoom.value > 1.001)
const viewportRatio = computed(() =>
  naturalSize.value ? `${naturalSize.value.width} / ${naturalSize.value.height}` : '4 / 3',
)
const viewportCursor = computed(() => {
  if (props.mode !== 'frame' || isInert.value) {
    return undefined
  }

  return dragging.value ? 'grabbing' : 'grab'
})
const imageStyle = computed(() => {
  const at = layout.value
  const crop = activeCrop.value
  const size = naturalSize.value

  if (!at || !crop || !size) {
    return {}
  }

  return {
    left: `${at.image.left + at.image.width / 2}px`,
    top: `${at.image.top + at.image.height / 2}px`,
    width: `${size.width * at.scale}px`,
    height: `${size.height * at.scale}px`,
    transform: `translate(-50%, -50%) scale(${crop.flipX ? -1 : 1}, ${crop.flipY ? -1 : 1}) rotate(${crop.rotation}deg)`,
  }
})
const selectionStyle = computed(() => {
  const at = layout.value

  if (!at) {
    return {}
  }

  return {
    left: `${at.selection.left}px`,
    top: `${at.selection.top}px`,
    width: `${at.selection.width}px`,
    height: `${at.selection.height}px`,
  }
})
const selectionAria = computed(() => {
  const crop = activeCrop.value
  const size = shown.value

  if (!crop || !size) {
    return {}
  }

  return {
    'aria-valuemin': 0,
    'aria-valuenow': crop.x,
    'aria-valuemax': Math.max(0, Math.round(size.width - crop.width)),
    'aria-valuetext': `${crop.width} by ${crop.height} pixels, at ${crop.x}, ${crop.y}`,
  }
})
const handleList = computed(() => {
  const at = layout.value
  const crop = activeCrop.value
  const size = shown.value

  if (!at || !crop || !size) {
    return []
  }

  const least = smallestSize(size, limits.value)

  return HANDLE_POSITIONS.map((position) => {
    const [across, down] = HANDLE_SPOTS[position]
    const vertical = position === 'n' || position === 's'
    const horizontal = position === 'e' || position === 'w'
    const valueNow = vertical ? crop.height : crop.width
    const valueMin = Math.ceil(vertical ? least.height : least.width)
    const valueMax = Math.round(vertical ? size.height : size.width)

    return {
      position,
      style: {
        left: `${at.selection.left + across * at.selection.width}px`,
        top: `${at.selection.top + down * at.selection.height}px`,
        cursor: isInert.value ? 'default' : HANDLE_CURSORS[position],
      },
      aria: {
        'aria-label': HANDLE_LABELS[position],
        'aria-orientation': vertical
          ? ('vertical' as const)
          : horizontal
            ? ('horizontal' as const)
            : undefined,
        'aria-valuemin': valueMin,
        'aria-valuenow': valueNow,
        'aria-valuemax': Math.max(valueMin, valueMax),
        'aria-valuetext': `${crop.width} by ${crop.height} pixels`,
        'aria-disabled': isInert.value || undefined,
      },
      dragging: dragging.value === position,
    }
  })
})

useAgentNode({
  name: 'image-cropper',
  el: () => rootRef.value,
  state: () => ({
    value: activeCrop.value,
    zoom: zoom.value,
    rotation: activeCrop.value?.rotation ?? 0,
    mode: props.mode,
    shape: props.shape,
    disabled: props.disabled,
  }),
  actions: {
    setCrop: (value) => setCrop(value as ImageCrop),
    rotate: (direction) => rotate(Number(direction) === -1 ? -1 : 1),
    flip: (direction) => flip(direction === 'vertical' ? 'vertical' : 'horizontal'),
    setZoom: (value) => setZoom(Number(value)),
  },
})

useResizeObserver(viewportRef, measureViewport)

function createChangeDetails(at: ImageCropperChangeAt): ImageCropperCropChangeDetails {
  return cancelableChangeDetailsFor(at) as ImageCropperCropChangeDetails
}

function createCommitDetails(at: ImageCropperChangeAt): ImageCropperCropCommitDetails {
  const details = createChangeDetails(at)

  return {
    source: details.source,
    reason: at.reason,
  }
}

function emitCropChange(crop: ImageCropperCrop, at: ImageCropperChangeAt): boolean {
  const current = activeCrop.value

  if (current && sameCrop(current, crop)) {
    return false
  }

  const details = createChangeDetails(at)

  emits('crop-change', crop, details)

  if (details.canceled) {
    return false
  }

  if (!isControlled.value) {
    innerCrop.value = crop
  }

  emits('update:crop', crop)

  return true
}

function commitCrop(at: ImageCropperChangeAt) {
  const crop = activeCrop.value

  if (!crop) {
    return
  }

  const details = createCommitDetails(at)

  emits('crop-commit', crop, details)

  if (instance) {
    notifyAgentChange(instance, crop, { ...details, canceled: false })
  }
}

function clearWheelCommit() {
  clearTimeout(wheelTimer)
  wheelTimer = undefined
  wheelEvent = undefined
  wheelCrop = null
}

function applyCropStep(next: ImageCropperCrop, at: ImageCropperChangeAt): boolean {
  clearWheelCommit()

  const crop = roundCrop(next)
  const changed = emitCropChange(crop, at)

  if (changed) {
    commitCrop(at)
  }

  return changed
}

function measureViewport() {
  const el = viewportRef.value

  if (!el) {
    viewportBox.value = { left: 0, top: 0, width: 0, height: 0 }

    return
  }

  const style = el.ownerDocument.defaultView?.getComputedStyle(el)
  const left = Number.parseFloat(style?.paddingLeft ?? '') || 0
  const top = Number.parseFloat(style?.paddingTop ?? '') || 0
  const right = Number.parseFloat(style?.paddingRight ?? '') || 0
  const bottom = Number.parseFloat(style?.paddingBottom ?? '') || 0
  const next = {
    left,
    top,
    width: Math.max(0, el.clientWidth - left - right),
    height: Math.max(0, el.clientHeight - top - bottom),
  }
  const current = viewportBox.value

  if (
    current.left === next.left &&
    current.top === next.top &&
    current.width === next.width &&
    current.height === next.height
  ) {
    return
  }

  viewportBox.value = next
}

function handleImageLoad(event?: Event) {
  const image = imageRef.value
  const size = image
    ? { width: image.naturalWidth, height: image.naturalHeight }
    : { width: 0, height: 0 }

  if (!size.width || !size.height) {
    handleImageError(event ?? new Event('error'))

    return
  }

  if (
    status.value === 'loaded' &&
    naturalSize.value?.width === size.width &&
    naturalSize.value.height === size.height
  ) {
    return
  }

  naturalSize.value = size
  status.value = 'loaded'

  const controlled = isControlled.value

  if (controlled && props.crop != null) {
    emits('load', size)

    return
  }

  if (!controlled && innerCrop.value && cropForSrc === props.src) {
    emits('load', size)

    return
  }

  cropForSrc = props.src

  if (!controlled && props.defaultCrop) {
    innerCrop.value = fitCrop(completeCrop(props.defaultCrop), size, limits.value)
    emits('load', size)

    return
  }

  const crop = props.defaultCrop
    ? fitCrop(completeCrop(props.defaultCrop), size, limits.value)
    : initialCrop(size, limits.value, props.mode)

  if (emitCropChange(crop, { reason: 'image-load' })) {
    commitCrop({ reason: 'image-load' })
  }

  emits('load', size)
}

function handleImageError(event: Event) {
  if (status.value === 'error') {
    return
  }

  status.value = 'error'
  naturalSize.value = null
  emits('error', event)
}

function syncImage() {
  const image = imageRef.value

  if (!image || !image.complete || !image.src) {
    return
  }

  if (image.naturalWidth && image.naturalHeight) {
    handleImageLoad()
  } else {
    handleImageError(new Event('error'))
  }
}

function setCrop(crop: ImageCrop): boolean {
  if (!activeCrop.value || !naturalSize.value || isInert.value) {
    return false
  }

  return applyCropStep(roundCrop(completeCrop(crop)), { reason: 'api' })
}

function rotateBy(direction: 1 | -1, at: ImageCropperChangeAt): boolean {
  const crop = activeCrop.value
  const size = naturalSize.value

  if (!crop || !size || isInert.value) {
    return false
  }

  return applyCropStep(rotateCrop(crop, size, direction, limits.value), at)
}

function rotate(direction: 1 | -1 = 1): boolean {
  return rotateBy(direction, { reason: 'api' })
}

function flipBy(direction: ImageCropperFlipDirection, at: ImageCropperChangeAt): boolean {
  const crop = activeCrop.value
  const size = naturalSize.value

  if (!crop || !size || isInert.value) {
    return false
  }

  return applyCropStep(flipCrop(crop, size, direction), at)
}

function flip(direction: ImageCropperFlipDirection = 'horizontal'): boolean {
  return flipBy(direction, { reason: 'api' })
}

function setZoomTo(value: number, at: ImageCropperChangeAt): boolean {
  const crop = activeCrop.value
  const size = naturalSize.value

  if (!crop || !size || !Number.isFinite(value) || isInert.value) {
    return false
  }

  return applyCropStep(zoomCrop(crop, size, value, limits.value), at)
}

function setZoom(value: number): boolean {
  return setZoomTo(value, { reason: 'api' })
}

function zoomByFactor(factor: number, at: ImageCropperChangeAt): boolean {
  return setZoomTo(zoom.value * factor, at)
}

function onRotatePress(event: MouseEvent) {
  rotateBy(1, { reason: 'rotate-press', event })
}

function onFlipPress(direction: ImageCropperFlipDirection, event: MouseEvent) {
  flipBy(direction, { reason: 'flip-press', event })
}

function onZoomPress(factor: number, event: MouseEvent) {
  zoomByFactor(factor, { reason: 'zoom-input', event })
}

function onSelectionPointerDown(event: PointerEvent, handle: ImageCropperResizeHandle) {
  const crop = activeCrop.value
  const at = layout.value

  if (
    isInert.value ||
    props.mode !== 'box' ||
    !crop ||
    !naturalSize.value ||
    !at ||
    drag ||
    (event.pointerType === 'mouse' && event.button !== 0)
  ) {
    return
  }

  if (
    handle === 'move' &&
    (event.target as Element | null)?.closest?.('[data-image-cropper-handle]')
  ) {
    return
  }

  event.preventDefault()

  const current = event.currentTarget as HTMLElement | null

  clearWheelCommit()
  current?.focus({ preventScroll: true })

  try {
    current?.setPointerCapture?.(event.pointerId)
  } catch {}

  drag = {
    pointerId: event.pointerId,
    handle,
    startX: event.clientX,
    startY: event.clientY,
    startCrop: crop,
    scale: at.scale,
    moved: false,
  }
  dragging.value = handle

  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragEnd)
  window.addEventListener('pointercancel', onDragCancel)
  document.addEventListener('keydown', onDragKeydown)
}

function applyDragMove(event: PointerEvent) {
  if (!drag || !naturalSize.value || isInert.value || event.pointerId !== drag.pointerId) {
    return
  }

  const dx = (event.clientX - drag.startX) / drag.scale
  const dy = (event.clientY - drag.startY) / drag.scale
  const crop = resizeCrop(
    drag.startCrop,
    naturalSize.value,
    drag.handle,
    dx,
    dy,
    limits.value,
    event.shiftKey,
  )

  if (emitCropChange(crop, { reason: 'drag', event })) {
    drag.moved = true
  }
}

function onDragMove(event: PointerEvent) {
  if (!drag || !naturalSize.value || isInert.value || event.pointerId !== drag.pointerId) {
    return
  }

  event.preventDefault()

  if (dragFrame) {
    pendingDragEvent = event

    return
  }

  applyDragMove(event)
  dragFrame = raf(() => {
    dragFrame = 0

    const pending = pendingDragEvent

    pendingDragEvent = null

    if (pending) {
      applyDragMove(pending)
    }
  })
}

function flushDragMove() {
  if (dragFrame) {
    caf(dragFrame)
    dragFrame = 0
  }

  const pending = pendingDragEvent

  pendingDragEvent = null

  if (pending) {
    applyDragMove(pending)
  }
}

function cancelDragMove() {
  if (dragFrame) {
    caf(dragFrame)
    dragFrame = 0
  }

  pendingDragEvent = null
}

function stopDrag() {
  cancelDragMove()
  drag = null
  dragging.value = null

  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragEnd)
  window.removeEventListener('pointercancel', onDragCancel)
  document.removeEventListener('keydown', onDragKeydown)
}

function onDragEnd(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) {
    return
  }

  flushDragMove()

  const moved = drag.moved

  stopDrag()

  if (moved) {
    commitCrop({ reason: 'drag', event })
  }
}

function cancelDrag(event: Event) {
  if (!drag) {
    return
  }

  const start = drag.startCrop

  stopDrag()

  if (emitCropChange(start, { reason: 'drag', event })) {
    commitCrop({ reason: 'drag', event })
  }
}

function onDragCancel(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) {
    return
  }

  cancelDrag(event)
}

function onDragKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  cancelDrag(event)
}

function beginFrameGesture() {
  const crop = activeCrop.value
  const at = layout.value
  const el = viewportRef.value

  if (!crop || !at || !el) {
    return
  }

  const points = [...framePointers.values()]

  if (!points.length) {
    return
  }

  const rect = el.getBoundingClientRect()
  const center = centerOf(points)

  frameGesture = {
    crop,
    center,
    distance: points.length > 1 ? spread(points) : 0,
    zoom: zoom.value,
    scale: at.scale,
    selection: {
      ...at.selection,
      left: at.selection.left + rect.left + el.clientLeft,
      top: at.selection.top + rect.top + el.clientTop,
    },
  }
}

function onViewportPointerDown(event: PointerEvent) {
  if (
    isInert.value ||
    props.mode !== 'frame' ||
    !activeCrop.value ||
    !naturalSize.value ||
    (event.pointerType === 'mouse' && event.button !== 0)
  ) {
    return
  }

  const el = viewportRef.value

  if (!el) {
    return
  }

  event.preventDefault()

  clearWheelCommit()
  cancelFrameMove()
  selectionRef.value?.focus({ preventScroll: true })

  try {
    el.setPointerCapture?.(event.pointerId)
  } catch {}

  if (!framePointers.size) {
    frameStartCrop = activeCrop.value
    frameMoved = false
  }

  framePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  beginFrameGesture()
  dragging.value = 'pan'

  window.removeEventListener('pointermove', onFrameMove)
  window.removeEventListener('pointerup', onFrameEnd)
  window.removeEventListener('pointercancel', onFrameCancel)
  document.removeEventListener('keydown', onFrameKeydown)

  window.addEventListener('pointermove', onFrameMove)
  window.addEventListener('pointerup', onFrameEnd)
  window.addEventListener('pointercancel', onFrameCancel)
  document.addEventListener('keydown', onFrameKeydown)
}

function applyFrameMove(event: PointerEvent) {
  if (!framePointers.has(event.pointerId) || !frameGesture || !naturalSize.value || isInert.value) {
    return
  }

  const points = [...framePointers.values()]
  const middle = centerOf(points)
  const { crop, center, distance, zoom: startZoom, scale, selection } = frameGesture

  if (points.length > 1 && distance) {
    frameReason = 'pinch'

    const anchor = {
      x: crop.x + (center.x - selection.left) / scale,
      y: crop.y + (center.y - selection.top) / scale,
    }
    const zoomed = zoomCrop(
      crop,
      naturalSize.value,
      startZoom * (spread(points) / distance),
      limits.value,
      anchor,
    )
    const k = selection.width / zoomed.width
    const targetX = anchor.x - (middle.x - selection.left) / k
    const targetY = anchor.y - (middle.y - selection.top) / k
    const next = resizeCrop(
      zoomed,
      naturalSize.value,
      'move',
      targetX - zoomed.x,
      targetY - zoomed.y,
      limits.value,
    )

    if (emitCropChange(next, { reason: 'pinch', event })) {
      frameMoved = true
    }

    return
  }

  frameReason = 'drag'

  const next = resizeCrop(
    crop,
    naturalSize.value,
    'move',
    (center.x - middle.x) / scale,
    (center.y - middle.y) / scale,
    limits.value,
  )

  if (emitCropChange(next, { reason: 'drag', event })) {
    frameMoved = true
  }
}

function onFrameMove(event: PointerEvent) {
  if (!framePointers.has(event.pointerId) || !frameGesture || !naturalSize.value || isInert.value) {
    return
  }

  event.preventDefault()
  framePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (frameFrame) {
    pendingFrameEvent = event

    return
  }

  applyFrameMove(event)
  frameFrame = raf(() => {
    frameFrame = 0

    const pending = pendingFrameEvent

    pendingFrameEvent = null

    if (pending) {
      applyFrameMove(pending)
    }
  })
}

function flushFrameMove() {
  if (frameFrame) {
    caf(frameFrame)
    frameFrame = 0
  }

  const pending = pendingFrameEvent

  pendingFrameEvent = null

  if (pending) {
    applyFrameMove(pending)
  }
}

function cancelFrameMove() {
  if (frameFrame) {
    caf(frameFrame)
    frameFrame = 0
  }

  pendingFrameEvent = null
}

function stopFrameGesture() {
  cancelFrameMove()
  framePointers.clear()
  frameGesture = null
  frameStartCrop = null
  frameMoved = false
  dragging.value = null

  window.removeEventListener('pointermove', onFrameMove)
  window.removeEventListener('pointerup', onFrameEnd)
  window.removeEventListener('pointercancel', onFrameCancel)
  document.removeEventListener('keydown', onFrameKeydown)
}

function finishActiveGestures() {
  if (drag) {
    flushDragMove()

    const moved = drag.moved

    stopDrag()

    if (moved) {
      commitCrop({ reason: 'drag' })
    }
  }

  if (framePointers.size) {
    flushFrameMove()

    const moved = frameMoved
    const reason = frameReason

    stopFrameGesture()

    if (moved) {
      commitCrop({ reason })
    }
  }
}

function onFrameEnd(event: PointerEvent) {
  if (!framePointers.has(event.pointerId)) {
    return
  }

  flushFrameMove()
  framePointers.delete(event.pointerId)

  if (framePointers.size) {
    beginFrameGesture()

    return
  }

  const moved = frameMoved
  const reason = frameReason

  stopFrameGesture()

  if (moved) {
    commitCrop({ reason, event })
  }
}

function onFrameCancel(event: PointerEvent) {
  if (!framePointers.has(event.pointerId)) {
    return
  }

  cancelFrameMove()
  framePointers.delete(event.pointerId)

  if (framePointers.size) {
    beginFrameGesture()

    return
  }

  const start = frameStartCrop
  const moved = frameMoved
  const reason = frameReason

  stopFrameGesture()

  if (start && moved && emitCropChange(start, { reason, event })) {
    commitCrop({ reason, event })
  }
}

function onFrameKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !frameStartCrop) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  const start = frameStartCrop
  const moved = frameMoved
  const reason = frameReason

  stopFrameGesture()

  if (moved && emitCropChange(start, { reason, event })) {
    commitCrop({ reason, event })
  }
}

function imagePoint(clientX: number, clientY: number) {
  const el = viewportRef.value
  const at = layout.value

  if (!el || !at) {
    return undefined
  }

  const rect = el.getBoundingClientRect()

  return {
    x: (clientX - rect.left - el.clientLeft - at.image.left) / at.scale,
    y: (clientY - rect.top - el.clientTop - at.image.top) / at.scale,
  }
}

function wheelUnit(event: WheelEvent, el: HTMLElement) {
  return event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientHeight : 1
}

function onWheel(event: WheelEvent) {
  const crop = activeCrop.value
  const size = naturalSize.value
  const el = viewportRef.value

  if (!crop || !size || !el || isInert.value || props.mode !== 'frame') {
    return
  }

  event.preventDefault()

  const delta = Math.min(50, Math.max(-50, event.deltaY * wheelUnit(event, el)))
  const next = zoomCrop(
    crop,
    size,
    zoom.value * Math.exp(-delta * 0.01),
    limits.value,
    imagePoint(event.clientX, event.clientY),
  )

  if (!emitCropChange(next, { reason: 'wheel', event })) {
    return
  }

  wheelEvent = event
  wheelCrop = next
  clearTimeout(wheelTimer)
  wheelTimer = setTimeout(() => {
    const pending = wheelCrop
    const current = activeCrop.value
    const lastEvent = wheelEvent

    wheelTimer = undefined
    wheelCrop = null
    wheelEvent = undefined

    if (!pending || !current || !sameCrop(current, pending)) {
      return
    }

    commitCrop({ reason: 'wheel', event: lastEvent })
  }, WHEEL_COMMIT_DELAY)
}

function onKeydown(event: KeyboardEvent, handle: ImageCropperResizeHandle) {
  const crop = activeCrop.value
  const size = naturalSize.value

  if (
    !crop ||
    !size ||
    isInert.value ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    (handle === 'move' &&
      (event.target as Element | null)?.closest?.('[data-image-cropper-handle]'))
  ) {
    return
  }

  const direction = ARROW_STEPS[event.key]

  if (direction) {
    const [x, y] = direction

    if ((x && (handle === 'n' || handle === 's')) || (y && (handle === 'e' || handle === 'w'))) {
      return
    }

    event.preventDefault()

    const unit = Math.max(1, Math.round(1 / (layout.value?.scale ?? 1)))
    const by = unit * (event.shiftKey ? DRAG_LARGE_STEP : 1)

    applyCropStep(resizeCrop(crop, size, handle, x * by, y * by, limits.value), {
      reason: 'step-key',
      event,
    })

    return
  }

  if (event.key === '+' || event.key === '=' || event.key === '-' || event.key === '_') {
    event.preventDefault()
    zoomByFactor(event.key === '+' || event.key === '=' ? ZOOM_STEP : 1 / ZOOM_STEP, {
      reason: 'zoom-key',
      event,
    })

    return
  }

  if (event.key === 'r' || event.key === 'R') {
    event.preventDefault()
    rotateBy(event.shiftKey ? -1 : 1, { reason: 'rotate-key', event })
  }
}

function centerOf(points: ImageCropperPointer[]) {
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  }
}

function spread(points: ImageCropperPointer[]) {
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
}

async function toFile(options: ImageCropperFileOptions = {}): Promise<File> {
  const crop = activeCrop.value
  const image = imageRef.value

  if (!crop || !image || !naturalSize.value) {
    throw new Error('The image is not ready to crop.')
  }

  return cropImageElement(image, crop, props.src ?? 'image', props.shape, options)
}

watch(
  () => props.src,
  () => {
    status.value = 'loading'
    naturalSize.value = null
    innerCrop.value = null
    cropForSrc = undefined

    clearWheelCommit()
    nextTick(syncImage)
  },
)

watch(isInert, (inert) => {
  if (!inert) {
    return
  }

  finishActiveGestures()
  clearWheelCommit()
})

watch(
  () => props.aspectRatio,
  (aspect) => {
    const crop = activeCrop.value
    const size = naturalSize.value

    if (!aspect || aspect <= 0 || !crop || !size) {
      return
    }

    applyCropStep(fitCrop(crop, size, limits.value), {
      reason: 'aspect-ratio-change',
    })
  },
)

onMounted(() => {
  measureViewport()
  syncImage()
})

onBeforeUnmount(() => {
  stopDrag()
  stopFrameGesture()
  clearWheelCommit()
})

defineExpose({
  getCrop: () => activeCrop.value,
  setCrop,
  rotate,
  flip,
  getZoom: () => zoom.value,
  setZoom,
  toFile,
})
</script>

<template>
  <div
    ref="rootRef"
    data-image-cropper
    v-bind="$attrs"
    role="group"
    :aria-busy="status === 'loading' ? 'true' : undefined"
    :data-mode="mode"
    :data-shape="shape"
    :data-loading="status === 'loading' || undefined"
    :data-error="status === 'error' || undefined"
    :data-disabled="disabled || undefined"
    :data-dragging="dragging ? true : undefined"
    class="pxd-image-cropper w-full overflow-hidden rounded-lg border bg-background-100"
  >
    <div
      ref="viewportRef"
      data-image-cropper-viewport
      class="pxd-image-cropper--viewport p-3 relative w-full overflow-hidden select-none"
      :class="mode === 'frame' ? 'touch-none' : undefined"
      :style="{ '--pxd-image-cropper-aspect-ratio': viewportRatio, cursor: viewportCursor }"
      @pointerdown="onViewportPointerDown"
      @wheel="onWheel"
    >
      <PCheckerboard class="inset-0 absolute" :dimension="20" />

      <img
        ref="imageRef"
        data-image-cropper-image
        :src="src"
        :alt="alt"
        :crossorigin="crossorigin"
        draggable="false"
        decoding="async"
        class="pxd-image-cropper--image pointer-events-none absolute max-h-none max-w-none select-none"
        :class="layout ? undefined : 'opacity-0'"
        :style="imageStyle"
        @load="handleImageLoad"
        @error="handleImageError"
      />

      <template v-if="layout && activeCrop">
        <div
          ref="selectionRef"
          data-image-cropper-selection
          role="slider"
          :tabindex="isInert ? -1 : 0"
          aria-label="Crop area"
          aria-roledescription="crop area"
          v-bind="selectionAria"
          :aria-disabled="disabled || undefined"
          :data-dragging="dragging === 'move' || dragging === 'pan' || undefined"
          class="pxd-image-cropper--selection border-white absolute z-1 border self-focus-ring outline-none"
          :class="[
            shape === 'circle' ? 'rounded-full' : 'rounded-xs',
            mode === 'frame' ? 'pointer-events-none' : 'touch-none',
            isInert ? 'cursor-default' : 'cursor-move',
          ]"
          :style="selectionStyle"
          @pointerdown="onSelectionPointerDown($event, 'move')"
          @keydown="onKeydown($event, 'move')"
        >
          <div
            v-if="shape === 'rectangle'"
            class="pxd-image-cropper--grid inset-0 pointer-events-none absolute overflow-hidden rounded-inherit"
          >
            <span class="bg-white/60 inset-y-0 absolute left-1/3 w-px" />
            <span class="bg-white/60 inset-y-0 absolute left-2/3 w-px" />
            <span class="bg-white/60 inset-x-0 absolute top-1/3 h-px" />
            <span class="bg-white/60 inset-x-0 absolute top-2/3 h-px" />
          </div>
        </div>

        <template v-if="mode === 'box'">
          <div
            v-for="handle in handleList"
            :key="handle.position"
            data-image-cropper-handle
            role="slider"
            :tabindex="isInert ? -1 : 0"
            :data-position="handle.position"
            :data-dragging="handle.dragging || undefined"
            v-bind="handle.aria"
            :style="handle.style"
            class="pxd-image-cropper--handle size-2.5 bg-white absolute z-2 -translate-x-1/2 -translate-y-1/2 touch-none rounded-[3px] border border-gray-alpha-600 shadow-small self-focus-ring outline-none"
            @pointerdown="onSelectionPointerDown($event, handle.position)"
            @keydown="onKeydown($event, handle.position)"
          />
        </template>
      </template>

      <div
        v-if="status === 'loading'"
        class="pxd-image-cropper--loading inset-0 absolute z-2 flex items-center justify-center bg-background-100/70"
      >
        <slot name="loading">
          <PSpinner class="text-xl text-foreground-secondary" />
        </slot>
      </div>

      <div
        v-else-if="status === 'error'"
        class="pxd-image-cropper--error inset-0 text-sm absolute z-2 flex items-center justify-center bg-background-100/70 text-foreground-secondary"
      >
        <slot name="error">Failed to load the image</slot>
      </div>
    </div>

    <div data-image-cropper-toolbar class="gap-1 px-2 py-2 flex items-center border-t">
      <PButton
        variant="ghost"
        size="sm"
        icon-only
        aria-label="Rotate clockwise"
        :disabled="isInert"
        @click="onRotatePress($event)"
      >
        <RotateClockwiseIcon class="size-4" />
      </PButton>

      <PButton
        variant="ghost"
        size="sm"
        icon-only
        aria-label="Flip horizontally"
        :disabled="isInert"
        @click="onFlipPress('horizontal', $event)"
      >
        <ArrowLeftRightIcon class="size-4" />
      </PButton>

      <PButton
        variant="ghost"
        size="sm"
        icon-only
        aria-label="Flip vertically"
        :disabled="isInert"
        @click="onFlipPress('vertical', $event)"
      >
        <ArrowUpDownIcon class="size-4" />
      </PButton>

      <div class="gap-0.5 ms-auto flex items-center">
        <PButton
          variant="ghost"
          size="sm"
          icon-only
          aria-label="Zoom out"
          :disabled="!canZoomOut"
          @click="onZoomPress(1 / ZOOM_STEP, $event)"
        >
          <MagnifyingGlassMinusIcon class="size-4" />
        </PButton>

        <span
          data-image-cropper-zoom
          class="min-w-11 text-xs text-center text-foreground-secondary tabular-nums"
        >
          {{ zoomPercent }}
        </span>

        <PButton
          variant="ghost"
          size="sm"
          icon-only
          aria-label="Zoom in"
          :disabled="!canZoomIn"
          @click="onZoomPress(ZOOM_STEP, $event)"
        >
          <MagnifyingGlassPlusIcon class="size-4" />
        </PButton>
      </div>

      <div v-if="$slots.actions" class="gap-1 flex items-center">
        <slot name="actions" :crop="activeCrop" :zoom="zoom" />
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-image-cropper--viewport {
  aspect-ratio: var(--pxd-image-cropper-aspect-ratio, 4 / 3);
}

.pxd-image-cropper--selection {
  box-shadow: 0 0 0 100vmax rgb(0 0 0 / 0.45);
}

.pxd-image-cropper--handle::before {
  content: '';
  position: absolute;
  inset: -0.4375rem;
  border-radius: 999px;
}

.pxd-image-cropper--grid {
  opacity: 0;
  transition: opacity var(--duration) var(--timing-function);
}

.pxd-image-cropper[data-dragging] .pxd-image-cropper--grid,
.pxd-image-cropper--selection:focus-visible .pxd-image-cropper--grid {
  opacity: 1;
}
</style>
