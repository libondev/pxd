<script lang="ts" setup>
import type {
  SwipeCellEmits,
  SwipeCellOverSwipeState,
  SwipeCellProps,
  SwipeCellSide,
  SwipeCellSlotState,
  SwipeCellCloseTrigger,
} from './types'
import type { CSSProperties } from 'vue'
import { computed, onMounted, onScopeDispose, shallowRef, watch } from 'vue'
import { useOutsideClick } from '../../composables/use-outside-click'

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
  overSwipeThreshold: 1.5,
  closeOnOverSwipe: false,
  closeOnClick: true,
})

const emits = defineEmits<SwipeCellEmits>()

const wrapperRef = shallowRef<HTMLElement>()
const prefixRef = shallowRef<HTMLElement>()
const suffixRef = shallowRef<HTMLElement>()

const offset = shallowRef(0)
const rawOffset = shallowRef(0)
const dragging = shallowRef(false)
const openedSide = shallowRef<SwipeCellSide | false>(props.modelValue)
const prefixWidth = shallowRef(0)
const suffixWidth = shallowRef(0)

let pointerState: {
  id: number
  startX: number
  startY: number
  startOffset: number
  startSide: SwipeCellSide | false
  axis: 'pending' | 'accepted' | 'rejected'
  moved: boolean
  target: Node
} | null = null

const hasPrefix = computed(() => prefixWidth.value > 0)
const hasSuffix = computed(() => suffixWidth.value > 0)
const currentSide = computed<SwipeCellSide | false>(() => {
  if (offset.value > 0) {
    return 'prefix'
  }

  if (offset.value < 0) {
    return 'suffix'
  }

  return false
})

const maxPrefixOffset = computed(() => (hasPrefix.value ? prefixWidth.value : 0))
const maxSuffixOffset = computed(() => (hasSuffix.value ? suffixWidth.value : 0))

const wrapperStyle = computed<CSSProperties>(() => ({
  transform: `translate3d(${offset.value}px, 0, 0)`,
}))

const prefixSlotState = computed(() => getSlotState('prefix'))
const suffixSlotState = computed(() => getSlotState('suffix'))

function getSlotState(side: SwipeCellSide): SwipeCellSlotState {
  const width = getSideWidth(side)
  const sideOffset = side === 'prefix' ? rawOffset.value : -rawOffset.value
  const distance = Math.max(0, sideOffset)
  const triggerDistance = width * props.overSwipeThreshold

  return {
    side,
    active: distance > 0,
    distance,
    progress: triggerDistance > 0 ? Math.min(distance / triggerDistance, 1) : 0,
    overSwipe: triggerDistance > 0 && distance >= triggerDistance,
  }
}

function resolveSide(value: number): SwipeCellSide | false {
  if (value > 0 && hasPrefix.value) {
    return 'prefix'
  }

  if (value < 0 && hasSuffix.value) {
    return 'suffix'
  }

  return false
}

function getSideWidth(side: SwipeCellSide) {
  return side === 'prefix' ? prefixWidth.value : suffixWidth.value
}

function getOpenOffset(side: SwipeCellSide | false) {
  if (side === 'prefix') {
    return maxPrefixOffset.value
  }

  if (side === 'suffix') {
    return -maxSuffixOffset.value
  }

  return 0
}

async function setOpen(side: SwipeCellSide | false, trigger?: SwipeCellCloseTrigger) {
  if (side) {
    updateSlotWidth()
  }

  const oldSide = openedSide.value || currentSide.value

  if (!side && !oldSide) {
    return true
  }

  if (!side && trigger && typeof props.beforeClose === 'function') {
    const isAllowed = await props.beforeClose(trigger)

    if (!isAllowed) {
      syncOpenOffset()
      return false
    }
  }

  openedSide.value = side
  syncOpenOffset()
  emits('update:modelValue', side)

  if (side) {
    emits('open', side)
    return true
  }

  emits('close')
  return true
}

function limitOffset(value: number) {
  if (value > 0 && !hasPrefix.value) {
    return 0
  }

  if (value < 0 && !hasSuffix.value) {
    return 0
  }

  if (value > 0) {
    return Math.min(value, prefixWidth.value)
  }

  if (value < 0) {
    return Math.max(value, -suffixWidth.value)
  }

  return 0
}

function resolveReleaseSide() {
  if (offset.value > 0 && hasPrefix.value) {
    return offset.value >= prefixWidth.value * props.threshold ? 'prefix' : false
  }

  if (offset.value < 0 && hasSuffix.value) {
    return Math.abs(offset.value) >= suffixWidth.value * props.threshold ? 'suffix' : false
  }

  return false
}

function resolveOverSwipeState(): SwipeCellOverSwipeState | null {
  const side = resolveSide(rawOffset.value)

  if (!side) {
    return null
  }

  const width = getSideWidth(side)
  const distance = Math.abs(rawOffset.value)

  if (width === 0 || distance < width * props.overSwipeThreshold) {
    return null
  }

  return {
    side,
    distance,
    width,
    direction: side === 'prefix' ? 'right' : 'left',
  }
}

function updateSlotWidth() {
  if (dragging.value) {
    return
  }

  prefixWidth.value = prefixRef.value?.offsetWidth ?? 0
  suffixWidth.value = suffixRef.value?.offsetWidth ?? 0
}

function syncOpenOffset() {
  offset.value = getOpenOffset(openedSide.value)
  rawOffset.value = offset.value
}

function close(trigger: SwipeCellCloseTrigger) {
  setOpen(false, trigger)
}

function closeByTarget(target: Node) {
  if (!currentSide.value) {
    return
  }

  if (prefixRef.value?.contains(target)) {
    close('left')
    return
  }

  if (suffixRef.value?.contains(target)) {
    close('right')
    return
  }

  if (props.closeOnClick) {
    close('content')
  }
}

function onWrapperClick(ev: MouseEvent) {
  if (ev.detail !== 0) {
    return
  }

  closeByTarget(ev.target as Node)
}

function bindPointerEvents() {
  window.addEventListener('pointermove', onPointerMove as EventListener)
  window.addEventListener('pointerup', onPointerUp as EventListener)
  window.addEventListener('pointercancel', onPointerCancel as EventListener)
}

function unbindPointerEvents() {
  window.removeEventListener('pointermove', onPointerMove as EventListener)
  window.removeEventListener('pointerup', onPointerUp as EventListener)
  window.removeEventListener('pointercancel', onPointerCancel as EventListener)
}

function resetPointerState() {
  unbindPointerEvents()
  pointerState = null
  dragging.value = false
}

function resolveAxisState(dx: number, dy: number) {
  if (Math.hypot(dx, dy) < 10) {
    return 'pending'
  }

  return Math.abs(dx) >= Math.abs(dy) ? 'accepted' : 'rejected'
}

function onPointerDown(ev: PointerEvent) {
  if (props.disabled || !ev.isPrimary || ev.button !== 0) {
    return
  }

  const target = ev.target

  if (!(target instanceof Node)) {
    return
  }

  updateSlotWidth()
  pointerState = {
    id: ev.pointerId,
    startX: ev.clientX,
    startY: ev.clientY,
    startOffset: offset.value,
    startSide: currentSide.value,
    axis: 'pending',
    moved: false,
    target,
  }
  rawOffset.value = offset.value

  wrapperRef.value?.setPointerCapture?.(ev.pointerId)
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
    state.axis = resolveAxisState(dx, dy)
  }

  if (state.axis === 'pending') {
    return
  }

  state.moved = true

  if (state.axis === 'rejected') {
    return
  }

  dragging.value = true
  rawOffset.value = state.startOffset + dx
  offset.value = limitOffset(rawOffset.value)
}

async function releaseSwipe() {
  const state = pointerState

  if (!state) {
    return
  }

  const overSwipeState = resolveOverSwipeState()

  dragging.value = false

  if (overSwipeState) {
    emits('over-swipe', overSwipeState)

    if (props.closeOnOverSwipe) {
      await setOpen(false, overSwipeState.side === 'prefix' ? 'left' : 'right')
      return
    }
  }

  if (state.startSide && resolveSide(rawOffset.value) !== state.startSide) {
    await setOpen(false, state.startSide === 'prefix' ? 'left' : 'right')
    return
  }

  await setOpen(resolveReleaseSide())
}

function onPointerUp(ev: PointerEvent) {
  const state = pointerState

  if (!state || ev.pointerId !== state.id) {
    return
  }

  if (state.axis === 'accepted') {
    void releaseSwipe()
  } else if (!state.moved) {
    closeByTarget(state.target)
  }

  wrapperRef.value?.releasePointerCapture?.(ev.pointerId)
  resetPointerState()
}

function onPointerCancel(ev: PointerEvent) {
  const state = pointerState

  if (!state || ev.pointerId !== state.id) {
    return
  }

  syncOpenOffset()
  wrapperRef.value?.releasePointerCapture?.(ev.pointerId)
  resetPointerState()
}

useOutsideClick(wrapperRef, {
  isEnabled: () => Boolean(openedSide.value),
  onTrigger: () => {
    close('outside')
  },
})

watch(
  () => props.modelValue,
  (value) => {
    openedSide.value = value

    if (value) {
      updateSlotWidth()
    }

    syncOpenOffset()
  },
)

onMounted(() => {
  if (props.modelValue) {
    updateSlotWidth()
    syncOpenOffset()
  }
})

onScopeDispose(() => {
  resetPointerState()
})
</script>

<template>
  <Component
    :is="as"
    class="pxd-swipe-cell w-full max-w-full touch-pan-y overflow-hidden"
    v-bind="$attrs"
  >
    <div
      ref="wrapperRef"
      class="pxd-swipe-cell--wrapper relative motion-safe:transition-transform"
      :class="{ 'transition-none! select-none': dragging }"
      :style="wrapperStyle"
      @pointerdown="onPointerDown"
      @click="onWrapperClick"
    >
      <div
        v-if="$slots.prefix"
        ref="prefixRef"
        class="pxd-swipe-cell--prefix inset-y-0 left-0 absolute z-0 flex h-full w-(--swipe-cell-slow-width) -translate-x-full items-center"
        :class="prefixClass"
      >
        <slot name="prefix" v-bind="prefixSlotState" />
      </div>

      <div
        v-if="$slots.suffix"
        ref="suffixRef"
        class="pxd-swipe-cell--suffix inset-y-0 right-0 absolute z-0 flex h-full w-(--swipe-cell-slow-width) translate-x-full items-center"
        :class="suffixClass"
      >
        <slot name="suffix" v-bind="suffixSlotState" />
      </div>

      <div class="pxd-swipe-cell--content relative z-1 bg-background-100" :class="contentClass">
        <slot />
      </div>
    </div>
  </Component>
</template>
