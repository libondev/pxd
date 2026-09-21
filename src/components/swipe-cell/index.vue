<script lang="ts" setup>
import type { SwipeCellEntry } from './instances'
import type {
  SwipeCellCloseTrigger,
  SwipeCellEmits,
  SwipeCellProps,
  SwipeCellSide,
  SwipeCellSlotState,
} from './types'
import { nextTick, onBeforeUnmount, onMounted, shallowReactive, shallowRef, watch } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { useOutsideClick } from '../../composables/use-outside-click'
import { getElement } from '../../utils/dom'
import { exclusiveOpen, registerSwipeCell } from './instances'

defineOptions({
  name: 'PSwipeCell',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<SwipeCellProps>(), {
  as: 'div',
  modelValue: false,
  threshold: 0.5,
  overSwipeThreshold: 1.8,
  closeOnOverSwipe: false,
  closeOnClick: true,
  exclusive: true,
  group: 'default',
})

const emits = defineEmits<SwipeCellEmits>()

const rootRef = shallowRef()
const contentRef = shallowRef<HTMLElement>()
const prefixRef = shallowRef<HTMLElement>()
const suffixRef = shallowRef<HTMLElement>()

let alive = true
let offset = 0
let openToken = 0
let trackOffset = 0

const dragging = shallowRef(false)
const openedSide = shallowRef<SwipeCellSide | false>(props.modelValue)
const prefixWidth = shallowRef(0)
const suffixWidth = shallowRef(0)

const prefixSlotState = shallowReactive<SwipeCellSlotState>({
  side: 'prefix',
  active: false,
  distance: 0,
  progress: 0,
  overSwipe: false,
})

const suffixSlotState = shallowReactive<SwipeCellSlotState>({
  side: 'suffix',
  active: false,
  distance: 0,
  progress: 0,
  overSwipe: false,
})

let pointerState: {
  id: number
  startX: number
  startY: number
  startOffset: number
  axis: 'pending' | 'accepted' | 'rejected'
  moved: boolean
  target: Node
} | null = null

const cellEntry: SwipeCellEntry = {
  getGroup: () => props.group,
  close: (trigger) => {
    void setOpen(false, trigger)
  },
}

const unregisterCell = registerSwipeCell(cellEntry)

function getRootEl() {
  return getElement(rootRef)
}

function applyOffset(next: number) {
  offset = next

  if (contentRef.value) {
    contentRef.value.style.transform = `translate3d(${next}px, 0, 0)`
  }
}

function clampOffset(raw: number) {
  if (raw > 0) {
    return prefixWidth.value > 0 ? Math.min(raw, prefixWidth.value) : 0
  }

  if (raw < 0) {
    return suffixWidth.value > 0 ? Math.max(raw, -suffixWidth.value) : 0
  }

  return 0
}

function openOffset(side: SwipeCellSide | false) {
  if (side === 'prefix') {
    return prefixWidth.value
  }

  if (side === 'suffix') {
    return -suffixWidth.value
  }

  return 0
}

function sideOf(value: number): SwipeCellSide | false {
  if (value > 0 && prefixWidth.value > 0) {
    return 'prefix'
  }

  if (value < 0 && suffixWidth.value > 0) {
    return 'suffix'
  }

  return false
}

function syncSlots() {
  for (const side of ['prefix', 'suffix'] as const) {
    const state = side === 'prefix' ? prefixSlotState : suffixSlotState
    const width = side === 'prefix' ? prefixWidth.value : suffixWidth.value
    const distance = Math.max(0, Math.round(side === 'prefix' ? trackOffset : -trackOffset))
    const trigger = width * props.overSwipeThreshold
    const progress = trigger > 0 ? Math.round(Math.min(distance / trigger, 1) * 100) / 100 : 0
    const overSwipe = trigger > 0 && distance >= trigger
    const active = distance > 0

    if (
      state.active === active &&
      state.distance === distance &&
      state.progress === progress &&
      state.overSwipe === overSwipe
    ) {
      continue
    }

    state.active = active
    state.distance = distance
    state.progress = progress
    state.overSwipe = overSwipe
  }
}

function syncOpenOffset() {
  trackOffset = openOffset(openedSide.value)
  applyOffset(trackOffset)
  syncSlots()
}

function measureWidths() {
  if (dragging.value) {
    return
  }

  prefixWidth.value = prefixRef.value?.offsetWidth ?? 0
  suffixWidth.value = suffixRef.value?.offsetWidth ?? 0

  if (openedSide.value) {
    syncOpenOffset()
  }
}

async function setOpen(side: SwipeCellSide | false, trigger?: SwipeCellCloseTrigger) {
  const token = ++openToken
  const prev = openedSide.value || sideOf(offset)

  if (!side && !prev) {
    return true
  }

  if (side && side === openedSide.value) {
    syncOpenOffset()
    return true
  }

  if (!side && trigger && props.beforeClose) {
    const allowed = await props.beforeClose(trigger)

    if (!alive || token !== openToken) {
      return false
    }

    if (!allowed) {
      syncOpenOffset()
      return false
    }
  } else if (!alive || token !== openToken) {
    return false
  }

  if (side) {
    measureWidths()

    if (props.exclusive) {
      exclusiveOpen(cellEntry)
    }
  }

  openedSide.value = side
  syncOpenOffset()
  emits('update:modelValue', side)

  if (side) {
    emits('open', side)
  } else {
    emits('close')
  }

  return true
}

function close(trigger: SwipeCellCloseTrigger = 'outside') {
  return setOpen(false, trigger)
}

function closeByTarget(target: Node) {
  if (props.disabled || !openedSide.value) {
    return
  }

  if (prefixRef.value?.contains(target)) {
    void close('prefix')
    return
  }

  if (suffixRef.value?.contains(target)) {
    void close('suffix')
    return
  }

  if (props.closeOnClick) {
    void close('content')
  }
}

function onWrapperClick(ev: MouseEvent) {
  if (ev.detail !== 0) {
    return
  }

  closeByTarget(ev.target as Node)
}

const moveOpts: AddEventListenerOptions = { passive: false }

function bindPointerEvents() {
  window.addEventListener('pointermove', onPointerMove as EventListener, moveOpts)
  window.addEventListener('pointerup', onPointerUp as EventListener)
  window.addEventListener('pointercancel', onPointerCancel as EventListener)
}

function unbindPointerEvents() {
  window.removeEventListener('pointermove', onPointerMove as EventListener, moveOpts)
  window.removeEventListener('pointerup', onPointerUp as EventListener)
  window.removeEventListener('pointercancel', onPointerCancel as EventListener)
}

function resetPointerState() {
  unbindPointerEvents()
  pointerState = null
  dragging.value = false
}

function onPointerDown(ev: PointerEvent) {
  if (props.disabled || !ev.isPrimary || ev.button !== 0) {
    return
  }

  const target = ev.target

  if (!(target instanceof Node)) {
    return
  }

  void beginGesture(ev, target)
}

async function beginGesture(ev: PointerEvent, target: Node) {
  if (openedSide.value && props.beforeClose) {
    const pointerId = ev.pointerId
    let earlyUp = false

    const onEarlyRelease = (releaseEv: PointerEvent) => {
      if (releaseEv.pointerId === pointerId) {
        earlyUp = true
      }
    }

    window.addEventListener('pointerup', onEarlyRelease, true)
    window.addEventListener('pointercancel', onEarlyRelease, true)

    let allowed = false

    try {
      allowed = await props.beforeClose(openedSide.value)
    } finally {
      window.removeEventListener('pointerup', onEarlyRelease, true)
      window.removeEventListener('pointercancel', onEarlyRelease, true)
    }

    if (!alive || props.disabled || !allowed) {
      return
    }

    if (earlyUp) {
      closeByTarget(target)
      return
    }
  }

  openToken += 1
  measureWidths()
  pointerState = {
    id: ev.pointerId,
    startX: ev.clientX,
    startY: ev.clientY,
    startOffset: trackOffset,
    axis: 'pending',
    moved: false,
    target,
  }

  getRootEl()?.setPointerCapture?.(ev.pointerId)
  bindPointerEvents()
}

function onPointerMove(ev: PointerEvent) {
  const state = pointerState

  if (!state || ev.pointerId !== state.id) {
    return
  }

  const dx = ev.clientX - state.startX
  const dy = ev.clientY - state.startY

  if (state.axis === 'pending') {
    if (Math.hypot(dx, dy) < 10) {
      return
    }

    state.axis = Math.abs(dx) >= Math.abs(dy) ? 'accepted' : 'rejected'
  }

  state.moved = true

  if (state.axis === 'rejected') {
    return
  }

  if (ev.cancelable) {
    ev.preventDefault()
  }

  if (!dragging.value) {
    dragging.value = true
  }

  trackOffset = state.startOffset + dx
  applyOffset(clampOffset(trackOffset))
  syncSlots()
}

async function releaseSwipe() {
  // Drop `transition-none` before settling, otherwise transform snaps with no transition.
  dragging.value = false
  await nextTick()

  const side = sideOf(trackOffset)
  const width = side === 'prefix' ? prefixWidth.value : side === 'suffix' ? suffixWidth.value : 0
  const distance = Math.abs(trackOffset)

  if (side && width > 0 && distance >= width * props.overSwipeThreshold) {
    emits('over-swipe', {
      side,
      distance,
      width,
      direction: side === 'prefix' ? 'right' : 'left',
    })

    if (props.closeOnOverSwipe) {
      await setOpen(false, side)
      return
    }
  }

  const reveal = Math.min(Math.abs(offset), width)
  const next = side && width > 0 && reveal >= width * props.threshold ? side : false

  if (!next && openedSide.value) {
    await setOpen(false, openedSide.value)
    return
  }

  await setOpen(next)
}

function onPointerUp(ev: PointerEvent) {
  const state = pointerState

  if (!state || ev.pointerId !== state.id) {
    return
  }

  const shouldRelease = state.axis === 'accepted'
  const shouldTapClose = !state.moved

  getRootEl()?.releasePointerCapture?.(ev.pointerId)
  resetPointerState()

  if (shouldRelease) {
    void releaseSwipe()
    return
  }

  if (shouldTapClose) {
    closeByTarget(state.target)
  }
}

function onPointerCancel(ev: PointerEvent) {
  const state = pointerState

  if (!state || ev.pointerId !== state.id) {
    return
  }

  openToken += 1
  syncOpenOffset()
  getRootEl()?.releasePointerCapture?.(ev.pointerId)
  resetPointerState()
}

useOutsideClick(getRootEl, {
  eventName: 'pointerdown',
  listenerOptions: { capture: true },
  enabled: () => Boolean(openedSide.value) && !props.disabled,
  onTrigger: () => {
    void close('outside')
  },
})

useResizeObserver([prefixRef, suffixRef], measureWidths)

watch(
  () => props.modelValue,
  (value) => {
    openToken += 1

    if (value === openedSide.value) {
      syncOpenOffset()
      return
    }

    openedSide.value = value

    if (value) {
      measureWidths()

      if (props.exclusive) {
        exclusiveOpen(cellEntry)
      }
    }

    syncOpenOffset()
  },
)

onMounted(() => {
  measureWidths()

  if (props.modelValue) {
    syncOpenOffset()

    if (props.exclusive) {
      exclusiveOpen(cellEntry)
    }
  }
})

onBeforeUnmount(() => {
  alive = false
  openToken += 1
  unregisterCell()
  resetPointerState()
})

defineExpose({
  close,
  open: (side: SwipeCellSide) => setOpen(side),
})
</script>

<template>
  <Component
    :is="as"
    ref="rootRef"
    class="pxd-swipe-cell relative w-full max-w-full touch-pan-y overflow-hidden"
    v-bind="$attrs"
    @pointerdown="onPointerDown"
    @click="onWrapperClick"
  >
    <div
      v-if="$slots.prefix"
      ref="prefixRef"
      class="pxd-swipe-cell--prefix inset-y-0 left-0 absolute z-0 flex h-full items-center"
      :class="prefixClass"
    >
      <slot name="prefix" v-bind="prefixSlotState" />
    </div>

    <div
      ref="contentRef"
      class="pxd-swipe-cell--content relative z-1 bg-background-100 motion-safe:transition-transform"
      :class="[{ 'transition-none! select-none': dragging }, contentClass]"
    >
      <slot />
    </div>

    <div
      v-if="$slots.suffix"
      ref="suffixRef"
      class="pxd-swipe-cell--suffix inset-y-0 right-0 absolute z-0 flex h-full items-center"
      :class="suffixClass"
    >
      <slot name="suffix" v-bind="suffixSlotState" />
    </div>
  </Component>
</template>
