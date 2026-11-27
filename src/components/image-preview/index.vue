<script lang="ts" setup>
import type {
  ImagePreviewEmits,
  ImagePreviewItem,
  ImagePreviewLoader,
  ImagePreviewProps,
  ImagePreviewStatus,
} from './types'
import ChevronLeftIcon from '@gdsicon/vue/chevron-left'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import CrossIcon from '@gdsicon/vue/cross'
import DownloadIcon from '@gdsicon/vue/download'
import MagnifyingGlassMinusIcon from '@gdsicon/vue/magnifying-glass-minus'
import MagnifyingGlassPlusIcon from '@gdsicon/vue/magnifying-glass-plus'
import RefreshCounterClockwiseIcon from '@gdsicon/vue/refresh-counter-clockwise'
import RotateClockwiseIcon from '@gdsicon/vue/rotate-clockwise'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useDialogLayer } from '../../composables/_internal/use-dialog-layer.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isServer } from '../../utils/is.js'
import PClientTeleport from '../_internal/client-teleport.vue'
import PSpinner from '../spinner/index.vue'

interface SourceState {
  status: ImagePreviewStatus
  src?: string
  loader: ImagePreviewLoader
}

defineOptions({
  name: 'PImagePreview',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ImagePreviewProps>(), {
  index: 0,
  mode: 'default',
  closeOnPressEscape: true,
  closeOnOutsideClick: true,
})

const emits = defineEmits<ImagePreviewEmits>()

const MIN_ZOOM = 0.25
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25
const DRAG_THRESHOLD = 3

const CONTROL_CLASS =
  'size-8 inline-flex text-sm cursor-pointer appearance-none items-center justify-center rounded-md border-0 bg-transparent p-0 font-inherit text-white outline-none hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white'
const ARROW_CLASS =
  'top-1/2 size-9 -translate-y-1/2 inline-flex cursor-pointer appearance-none items-center justify-center rounded-full border-0 bg-gray-alpha-700 p-0 font-inherit text-white outline-none hover:bg-gray-alpha-900 focus-visible:outline-2 focus-visible:outline-white absolute'

let hasDragged = false
let dragStartX = 0
let dragStartY = 0
let dragOriginX = 0
let dragOriginY = 0
let previousSources: ImagePreviewItem['src'][] = []

const panelRef = shallowRef<HTMLElement>()
const isVisible = shallowRef(false)
const activeIndex = shallowRef(props.index)
const zoom = shallowRef(1)
const rotation = shallowRef(0)
const offsetX = shallowRef(0)
const offsetY = shallowRef(0)
const isDragging = shallowRef(false)
const sources = shallowRef<Record<number, SourceState>>({})

const images = computed<ImagePreviewItem[]>(() =>
  (props.data ?? []).map((image) => (typeof image === 'string' ? { src: image } : image)),
)

const items = computed(() =>
  images.value.map((image, index) => ({ image, index, ...resolveSource(index, image) })),
)

const currentIndex = computed(() => {
  const length = images.value.length

  if (length === 0) {
    return 0
  }

  return Math.min(Math.max(activeIndex.value, 0), length - 1)
})

const currentImage = computed(() => images.value[currentIndex.value])
const currentItem = computed(() => items.value[currentIndex.value])
const dialogLabel = computed(() => currentImage.value?.alt || 'Image preview')
const zoomPercent = computed(() => `${Math.round(zoom.value * 100)}%`)
const imageStyle = computed(() => ({
  transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) scale(${zoom.value}) rotate(${rotation.value}deg)`,
}))

const configProvider = useConfigProvider()

const { setDialogRef, isClosing, onCancel, onNativeClose, onDialogSubmit, onAfterLeave } =
  useDialogLayer({
    visible: () => isVisible.value,
    closeOnPressEscape: () => props.closeOnPressEscape,
    onClose: () => close(),
  })

useAgentNode({
  name: 'image-preview',
  el: () => panelRef.value,
  state: () => ({
    open: isVisible.value,
    value: currentIndex.value,
    count: images.value.length,
    zoom: zoom.value,
    rotation: rotation.value,
  }),
  items: () =>
    images.value.map((image, index) => ({
      ...(image.alt && { label: image.alt }),
      value: index,
      ...(index === currentIndex.value && { selected: true }),
    })),
  actions: {
    setOpen: (value) => (value ? open() : close()),
    setValue: (index) => {
      switchTo(Number(index))
      requestCurrent()
    },
    zoomIn,
    zoomOut,
    rotate,
    reset,
  },
})

function isLoader(src: ImagePreviewItem['src']): src is ImagePreviewLoader {
  return typeof src === 'function'
}

function resolveSource(
  index: number,
  image: ImagePreviewItem,
): Pick<SourceState, 'status' | 'src'> {
  if (!isLoader(image.src)) {
    return { status: 'ready', src: image.src }
  }

  const source = sources.value[index]

  return source?.loader === image.src ? source : { status: 'loading' }
}

function setSource(index: number, source: SourceState) {
  sources.value = { ...sources.value, [index]: source }
}

function loadSource(index: number, image: ImagePreviewItem) {
  const loader = image.src

  if (!isLoader(loader) || sources.value[index]?.loader === loader) {
    return
  }

  setSource(index, { status: 'loading', loader })

  loader().then(
    (src) => {
      if (sources.value[index]?.loader === loader) {
        setSource(index, { status: 'ready', loader, src })
      }
    },
    () => {
      if (sources.value[index]?.loader === loader) {
        setSource(index, { status: 'error', loader })
      }
    },
  )
}

function requestCurrent() {
  const item = currentItem.value

  if (item) {
    emits('request', item.index, item.image)
    loadSource(item.index, item.image)
  }
}

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

function getDownloadName(src: string) {
  if (src.startsWith('data:')) {
    return 'image'
  }

  return src.split(/[?#]/)[0].split('/').pop() || 'image'
}

async function download() {
  const src = currentItem.value?.src

  if (!src) {
    return
  }

  const blob = await (await fetch(src)).blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = getDownloadName(src)
  link.click()
  setTimeout(() => URL.revokeObjectURL(url))
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
  emits('index-change', nextIndex)
}

function switchBy(delta: number) {
  switchTo(currentIndex.value + delta)
  requestCurrent()
}

function open(index = currentIndex.value) {
  if (images.value.length === 0) {
    return
  }

  isVisible.value = true
  resetTransform()
  switchTo(index)
  requestCurrent()
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

  if (props.closeOnOutsideClick) {
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
  () => images.value.map((image) => image.src),
  (sources) => {
    const unchanged =
      sources.length === previousSources.length &&
      sources.every((source, index) => source === previousSources[index])

    previousSources = sources

    if (unchanged || isServer() || props.mode === 'viewer') {
      return
    }

    images.value.forEach((image, index) => loadSource(index, image))
  },
  { immediate: true },
)

watch(
  () => props.index,
  (index) => {
    activeIndex.value = index
  },
)

watch(currentIndex, () => {
  resetTransform()
})

onBeforeUnmount(() => {
  onPointerUp()
})

defineExpose({
  open,
  close,
  zoomIn,
  zoomOut,
  rotate,
  reset,
  download,
})
</script>

<template>
  <div data-image-preview v-bind="$attrs">
    <div v-if="mode !== 'viewer'" class="gap-2 flex flex-wrap">
      <button
        v-for="item in items"
        :key="item.index"
        type="button"
        :aria-label="item.image.alt || `Preview image ${item.index + 1}`"
        class="size-20 p-0 shrink-0 cursor-pointer appearance-none overflow-hidden rounded-lg border-0 bg-gray-100 self-focus-ring"
        @click="open(item.index)"
      >
        <slot
          name="item"
          :image="item.image"
          :index="item.index"
          :src="item.src"
          :status="item.status"
        >
          <img
            v-if="item.src"
            :src="item.src"
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

    <PClientTeleport to="body">
      <dialog
        :ref="setDialogRef"
        class="pxd-dialog inset-0 m-0 p-0 pointer-events-auto fixed size-full max-h-full max-w-full overflow-visible border-0 bg-transparent text-inherit outline-none backdrop:hidden"
        :data-closing="isClosing || undefined"
        :aria-label="dialogLabel"
        @cancel="onCancel"
        @close="onNativeClose"
        @keydown="onKeydown"
        @submit="onDialogSubmit"
      >
        <Transition name="pxd-transition--fade" appear @after-leave="onAfterLeave">
          <div
            v-if="isVisible"
            ref="panelRef"
            data-image-preview-dialog
            :aria-label="dialogLabel"
            class="pxd-image-preview--dialog inset-0 text-white pointer-events-auto fixed flex flex-col bg-background-100/80 outline-none select-none"
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
              <template v-if="currentItem">
                <img
                  v-if="currentItem.src"
                  :key="currentItem.src"
                  :src="currentItem.src"
                  :alt="currentItem.image.alt || `Image ${currentIndex + 1}`"
                  draggable="false"
                  class="size-full object-contain"
                  :style="imageStyle"
                />

                <slot
                  v-else-if="currentItem.status === 'loading'"
                  name="loading"
                  :index="currentIndex"
                  :item="currentItem.image"
                >
                  <span class="flex size-full items-center justify-center">
                    <PSpinner class="text-2xl text-white/70" />
                  </span>
                </slot>

                <slot v-else name="error" :index="currentIndex" :item="currentItem.image">
                  <span class="text-sm text-white/70 flex size-full items-center justify-center">
                    Failed to load image
                  </span>
                </slot>
              </template>
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
              class="top-10 right-10 absolute"
              :class="CONTROL_CLASS"
              @click="close"
            >
              <CrossIcon class="size-em" />
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
              class="bottom-4 p-1 gap-0.5 backdrop-blur-sm absolute left-1/2 flex -translate-x-1/2 items-center rounded-lg bg-gray-alpha-700"
            >
              <button type="button" aria-label="Zoom out" :class="CONTROL_CLASS" @click="zoomOut">
                <MagnifyingGlassMinusIcon class="size-em" />
              </button>

              <span data-image-preview-zoom class="min-w-12 text-sm text-center tabular-nums">
                {{ zoomPercent }}
              </span>

              <button type="button" aria-label="Zoom in" :class="CONTROL_CLASS" @click="zoomIn">
                <MagnifyingGlassPlusIcon class="size-em" />
              </button>

              <button type="button" aria-label="Rotate" :class="CONTROL_CLASS" @click="rotate">
                <RotateClockwiseIcon class="size-em" />
              </button>

              <button type="button" aria-label="Reset" :class="CONTROL_CLASS" @click="reset">
                <RefreshCounterClockwiseIcon class="size-em" />
              </button>

              <button type="button" aria-label="Download" :class="CONTROL_CLASS" @click="download">
                <DownloadIcon class="size-em" />
              </button>
            </div>
          </div>
        </Transition>
      </dialog>
    </PClientTeleport>
  </div>
</template>
