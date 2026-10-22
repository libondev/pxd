<script lang="ts" setup>
import type { ImagePreviewEmits, ImagePreviewItem, ImagePreviewProps } from './types'
import ChevronLeftIcon from '@gdsicon/vue/chevron-left'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import CrossIcon from '@gdsicon/vue/cross'
import MagnifyingGlassMinusIcon from '@gdsicon/vue/magnifying-glass-minus'
import MagnifyingGlassPlusIcon from '@gdsicon/vue/magnifying-glass-plus'
import RefreshCounterClockwiseIcon from '@gdsicon/vue/refresh-counter-clockwise'
import RotateClockwiseIcon from '@gdsicon/vue/rotate-clockwise'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useFocusTrap } from '../../composables/_internal/use-focus-trap.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isServer } from '../../utils/is.js'
import POverlay from '../overlay/index.vue'

defineOptions({
  name: 'PImagePreview',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ImagePreviewProps>(), {
  index: 0,
  closeOnPressEscape: true,
  closeOnClickOverlay: true,
})

const emits = defineEmits<ImagePreviewEmits>()

const MIN_ZOOM = 0.25
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25
const DRAG_THRESHOLD = 3

const CONTROL_CLASS =
  'size-8 inline-flex cursor-pointer appearance-none items-center justify-center rounded-md border-0 bg-transparent p-0 font-inherit text-white outline-none hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white'
const ARROW_CLASS =
  'top-1/2 size-9 -translate-y-1/2 inline-flex cursor-pointer appearance-none items-center justify-center rounded-full border-0 bg-black/50 p-0 font-inherit text-white outline-none hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-white absolute'

let hasDragged = false
let dragStartX = 0
let dragStartY = 0
let dragOriginX = 0
let dragOriginY = 0

const dialogRef = shallowRef<HTMLElement>()
const isVisible = shallowRef(false)
const activeIndex = shallowRef(props.index)
const zoom = shallowRef(1)
const rotation = shallowRef(0)
const offsetX = shallowRef(0)
const offsetY = shallowRef(0)
const isDragging = shallowRef(false)

const images = computed<ImagePreviewItem[]>(() =>
  (props.data ?? []).map((image) => (typeof image === 'string' ? { src: image } : image)),
)

const currentIndex = computed(() => {
  const length = images.value.length

  if (length === 0) {
    return 0
  }

  return Math.min(Math.max(activeIndex.value, 0), length - 1)
})

const currentImage = computed(() => images.value[currentIndex.value])
const dialogLabel = computed(() => currentImage.value?.alt || 'Image preview')
const zoomPercent = computed(() => `${Math.round(zoom.value * 100)}%`)
const imageStyle = computed(() => ({
  transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) scale(${zoom.value}) rotate(${rotation.value}deg)`,
}))
const dialogStyle = computed(() => ({
  '--image-preview-index': props.zIndex ?? 'calc(var(--modal-index) + 5)',
}))

const configProvider = useConfigProvider()
useFocusTrap(dialogRef)

function resetTransform() {
  zoom.value = 1
  rotation.value = 0
  offsetX.value = 0
  offsetY.value = 0
}

function setZoom(value: number) {
  zoom.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function zoomIn() {
  setZoom(zoom.value + ZOOM_STEP)
}

function zoomOut() {
  setZoom(zoom.value - ZOOM_STEP)
}

function rotate() {
  rotation.value = (rotation.value + 90) % 360
}

function reset() {
  resetTransform()
}

function switchTo(index: number) {
  const length = images.value.length

  if (length === 0) {
    return
  }

  const nextIndex = ((index % length) + length) % length

  if (nextIndex === currentIndex.value) {
    return
  }

  activeIndex.value = nextIndex
  resetTransform()
  emits('index-change', nextIndex)
}

function switchBy(delta: number) {
  switchTo(currentIndex.value + delta)
}

function open(index = currentIndex.value) {
  if (images.value.length === 0) {
    return
  }

  isVisible.value = true
  resetTransform()
  switchTo(index)
}

function close() {
  isVisible.value = false
}

function onBackdropClick(ev: MouseEvent) {
  if (ev.target !== ev.currentTarget) {
    return
  }

  if (hasDragged) {
    hasDragged = false

    return
  }

  if (props.closeOnClickOverlay) {
    close()
  }
}

function onPointerDown(ev: PointerEvent) {
  if (ev.button !== 0) {
    return
  }

  hasDragged = false
  isDragging.value = true
  dragStartX = ev.clientX
  dragStartY = ev.clientY
  dragOriginX = offsetX.value
  dragOriginY = offsetY.value

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

function onPointerMove(ev: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  const deltaX = ev.clientX - dragStartX
  const deltaY = ev.clientY - dragStartY

  if (Math.abs(deltaX) + Math.abs(deltaY) > DRAG_THRESHOLD) {
    hasDragged = true
  }

  offsetX.value = dragOriginX + deltaX
  offsetY.value = dragOriginY + deltaY
}

function onPointerUp() {
  isDragging.value = false

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

function onWheel(ev: WheelEvent) {
  setZoom(zoom.value + (ev.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP))
}

function onKeydown(ev: KeyboardEvent) {
  if (images.value.length < 2) {
    return
  }

  if (ev.key === 'ArrowLeft') {
    ev.preventDefault()
    switchBy(-1)

    return
  }

  if (ev.key === 'ArrowRight') {
    ev.preventDefault()
    switchBy(1)
  }
}

watch(
  () => props.index,
  (index) => {
    activeIndex.value = index
  },
)

watch(currentIndex, () => {
  resetTransform()
})

watch(isVisible, (visible) => {
  if (isServer()) {
    return
  }

  if (visible) {
    document.addEventListener('keydown', onKeydown)

    return
  }

  document.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  onPointerUp()

  if (isServer()) {
    return
  }

  document.removeEventListener('keydown', onKeydown)
})

defineExpose({
  open,
  close,
  zoomIn,
  zoomOut,
  rotate,
  reset,
})
</script>

<template>
  <div data-image-preview v-bind="$attrs">
    <div class="gap-2 flex flex-wrap">
      <button
        v-for="(image, index) in images"
        :key="`${image.src}-${index}`"
        type="button"
        :aria-label="image.alt || `Preview image ${index + 1}`"
        class="size-20 p-0 shrink-0 cursor-pointer appearance-none overflow-hidden rounded-md border-0 bg-gray-100 self-focus-ring"
        @click="open(index)"
      >
        <slot name="item" :image="image" :index="index">
          <img
            :src="image.src"
            alt=""
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            crossorigin="anonymous"
            class="size-full object-cover"
          />
        </slot>
      </button>
    </div>

    <POverlay
      v-model="isVisible"
      variant="none"
      :z-index="zIndex"
      :close-on-press-escape="closeOnPressEscape"
    >
      <Transition name="pxd-transition--fade" appear>
        <div
          v-if="isVisible"
          ref="dialogRef"
          data-image-preview-dialog
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          :aria-label="dialogLabel"
          class="pxd-image-preview--dialog inset-0 bg-black/90 text-white pointer-events-auto fixed z-(--image-preview-index) flex flex-col outline-none select-none"
          :style="dialogStyle"
          @click="onBackdropClick"
        >
          <div
            data-image-preview-stage
            class="min-h-0 relative flex-1 touch-none overflow-hidden"
            :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
            @pointerdown="onPointerDown"
            @wheel.prevent="onWheel"
            @click="onBackdropClick"
          >
            <img
              v-if="currentImage"
              :key="currentImage.src"
              :src="currentImage.src"
              :alt="currentImage.alt || `Image ${currentIndex + 1}`"
              draggable="false"
              class="size-full object-contain"
              :style="imageStyle"
            />
          </div>

          <span
            v-if="images.length > 1"
            data-image-preview-counter
            aria-live="polite"
            class="top-4 left-4 text-sm text-white/80 absolute"
          >
            {{ currentIndex + 1 }} / {{ images.length }}
          </span>

          <button
            type="button"
            :aria-label="configProvider.locale.interaction.close"
            class="top-4 right-4 absolute"
            :class="CONTROL_CLASS"
            @click="close"
          >
            <CrossIcon class="size-4" />
          </button>

          <button
            v-if="images.length > 1"
            type="button"
            aria-label="Previous image"
            class="left-4"
            :class="ARROW_CLASS"
            @click="switchBy(-1)"
          >
            <ChevronLeftIcon class="size-5" />
          </button>

          <button
            v-if="images.length > 1"
            type="button"
            aria-label="Next image"
            class="right-4"
            :class="ARROW_CLASS"
            @click="switchBy(1)"
          >
            <ChevronRightIcon class="size-5" />
          </button>

          <div
            class="bottom-4 p-1 gap-0.5 bg-black/50 backdrop-blur-sm absolute left-1/2 flex -translate-x-1/2 items-center rounded-lg"
          >
            <button type="button" aria-label="Zoom out" :class="CONTROL_CLASS" @click="zoomOut">
              <MagnifyingGlassMinusIcon class="size-4" />
            </button>

            <span data-image-preview-zoom class="min-w-12 text-sm text-center tabular-nums">
              {{ zoomPercent }}
            </span>

            <button type="button" aria-label="Zoom in" :class="CONTROL_CLASS" @click="zoomIn">
              <MagnifyingGlassPlusIcon class="size-4" />
            </button>

            <button type="button" aria-label="Rotate" :class="CONTROL_CLASS" @click="rotate">
              <RotateClockwiseIcon class="size-4" />
            </button>

            <button type="button" aria-label="Reset" :class="CONTROL_CLASS" @click="reset">
              <RefreshCounterClockwiseIcon class="size-4" />
            </button>
          </div>
        </div>
      </Transition>
    </POverlay>
  </div>
</template>
