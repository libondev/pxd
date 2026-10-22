<script lang="ts" setup>
import type { PopoverEmits, PopoverProps, PopoverTrigger } from './types'
import type { VirtualElement } from '@floating-ui/dom'
import type { CSSProperties } from 'vue'
import { arrow, autoUpdate, computePosition, flip, shift, hide } from '@floating-ui/dom'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useFocusTrap } from '../../composables/_internal/use-focus-trap.js'
import { useDelayDestroy } from '../../composables/use-delay-destroy.js'
import { useOutsideClick } from '../../composables/use-outside-click.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { caf, raf, throttleByRaf } from '../../utils/event.js'
import { getCssUnitValue, isTruthyProp, toArray } from '../../utils/format.js'
import PPopoverArrow from '../_internal/popover-arrow.vue'
import POverlay from '../overlay/index.vue'

defineOptions({
  name: 'PPopover',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<PopoverProps>(), {
  trigger: () => ['hover'],
  position: 'bottom',
  showDelay: 0,
  hideDelay: 0,
  interactive: true,
  autoPosition: true,
  destroyDelay: 3000,
  fillTriggerWidth: true,
  toggleOnTrigger: true,
  closeOnInvisible: true,
  autoFocusElement: false,
  closeOnPressEscape: true,
  closeOnOutsideClick: true,
  returnFocusOnDeactivate: true,
})

const emits = defineEmits<PopoverEmits>()

let showPopoverTimer: ReturnType<typeof setTimeout> | null
let hidePopoverTimer: ReturnType<typeof setTimeout> | null
let triggerElementsCache: HTMLElement[] | null = null
let cleanupAutoUpdate: (() => void) | null = null
let hideFrame = 0
const throttledUpdatePosition = throttleByRaf(updatePosition)

const arrowRef = shallowRef<HTMLElement>(null!)
const triggerRef = shallowRef<HTMLElement>(null!)
const wrapperRef = shallowRef<HTMLElement>(null!)
const activeTriggerRef = shallowRef<HTMLElement | null>(null)
const activeTriggerIndex = shallowRef(-1)
const pointerPosition = shallowRef<{ x: number; y: number } | null>(null)

const pointReference: VirtualElement = {
  getBoundingClientRect() {
    const { x = 0, y = 0 } = pointerPosition.value ?? {}

    return {
      x,
      y,
      top: y,
      left: x,
      right: x,
      bottom: y,
      width: 0,
      height: 0,
      toJSON: () => ({}),
    }
  },
}

const localPosition = shallowRef(props.position)
const triggerMethods = computed<PopoverTrigger[]>(() => toArray(props.trigger))
const isManual = computed(() => triggerMethods.value.includes('manual'))
const wrapperStyle = computed<CSSProperties>(() => ({
  '--popover-index': props.zIndex,
  '--popover-offset': props.offset,
  '--popover-arrow-color': props.arrowColor,
  '--popover-max-width': getCssUnitValue(props.maxWidth),
}))
// Hover popovers must not steal focus; click ones trap Tab but only focus on request.
const focusTrapContainer = computed(() =>
  isVisible.value &&
  (isTruthyProp(props.autoFocusElement) || triggerMethods.value.includes('click'))
    ? wrapperRef.value
    : null,
)
const overlayZIndex = computed(() => {
  if (props.zIndex === undefined || props.zIndex === '') {
    return undefined
  }

  const value = Number(props.zIndex)

  return Number.isFinite(value) ? value : undefined
})

const configProvider = useConfigProvider()
const {
  render: isRender,
  visible: isVisible,
  show: showPopover,
  hide: hidePopover,
} = useDelayDestroy(props.modelValue, {
  delay: () => props.destroyDelay,
  visibleChange(v) {
    if (isManual.value) {
      return
    }

    emits('visible-change', v)

    if (v) {
      emits('show')
      emits('update:modelValue', true)
    } else {
      emits('hide')
      emits('update:modelValue', false)
    }
  },
})

useFocusTrap(focusTrapContainer, () => {
  const options = {
    autoFocusElement: props.autoFocusElement,
    returnFocusOnDeactivate: props.returnFocusOnDeactivate,
  }

  return isTruthyProp(props.autoFocusElement) ? options : { ...options, initialFocus: false }
})

useOutsideClick(wrapperRef, {
  allowList: [triggerRef, wrapperRef],
  enabled: () => isVisible.value,
  onTrigger: (ev) => {
    emits('outside-click', ev)

    if (!isManual.value && props.closeOnOutsideClick) {
      handlePopoverHide()
    }
  },
})

function clearShowTimer() {
  if (showPopoverTimer) {
    clearTimeout(showPopoverTimer)
    showPopoverTimer = null
  }
}

function cancelHideFrame() {
  caf(hideFrame)
  hideFrame = 0
}

// One frame of grace lets a pointer crossing the gap between matched triggers reach the next one.
function hideOnNextFrame() {
  if (hideFrame) {
    return
  }

  hideFrame = raf(() => {
    hideFrame = 0
    handlePopoverHide()
  })
}

function clearHideTimer() {
  cancelHideFrame()

  if (hidePopoverTimer) {
    clearTimeout(hidePopoverTimer)
    hidePopoverTimer = null
  }
}

function getTriggerElements() {
  if (!props.triggerSelector) {
    return []
  }

  if (!triggerElementsCache) {
    triggerElementsCache = Array.from(
      triggerRef.value.querySelectorAll<HTMLElement>(props.triggerSelector),
    )
  }

  return triggerElementsCache
}

function clearTriggerElementsCache() {
  triggerElementsCache = null
}

function resolveTriggerElement(target: EventTarget | null) {
  if (!props.triggerSelector) {
    return triggerRef.value
  }

  if (!(target instanceof Element)) {
    return null
  }

  const matched = target.closest<HTMLElement>(props.triggerSelector)

  if (!matched || !triggerRef.value.contains(matched)) {
    return null
  }

  return matched
}

// Capture phase makes the nearest popover own the event; an ignored subtree owns none.
function isForeignTarget(target: EventTarget | null) {
  if (!(target instanceof Element) || target.closest('[data-popover-ignore]')) {
    return true
  }

  if (target.closest('[data-popover]') === triggerRef.value) {
    return false
  }

  if (isVisible.value) {
    handlePopoverHide()
  }

  return true
}

function setActiveTrigger(trigger: HTMLElement | null) {
  activeTriggerRef.value = trigger

  if (!props.triggerSelector) {
    activeTriggerIndex.value = 0
    return
  }

  activeTriggerIndex.value = trigger ? getTriggerElements().indexOf(trigger) : -1
}

function ensureActiveTrigger() {
  if (!props.triggerSelector) {
    if (!activeTriggerRef.value) {
      setActiveTrigger(triggerRef.value)
    }

    return
  }

  if (!activeTriggerRef.value || !triggerRef.value.contains(activeTriggerRef.value)) {
    setActiveTrigger(getTriggerElements()[0] ?? null)
  }
}

function getReferenceElement() {
  if (props.alignPoint && pointerPosition.value) {
    return pointReference
  }

  ensureActiveTrigger()

  return activeTriggerRef.value || triggerRef.value
}

function startAutoUpdate() {
  if (!props.autoPosition || !wrapperRef.value) {
    return
  }

  cleanupAutoUpdate = autoUpdate(getReferenceElement(), wrapperRef.value, updatePosition)
}

async function syncPosition() {
  disposeAutoUpdate()
  await nextTick()
  await updatePosition()
  startAutoUpdate()
}

async function updateActiveTrigger(trigger: HTMLElement | null) {
  if (!trigger) {
    return
  }

  clearHideTimer()

  if (trigger === activeTriggerRef.value) {
    return
  }

  setActiveTrigger(trigger)

  if (isVisible.value) {
    await syncPosition()
  }
}

function disposeAutoUpdate() {
  if (cleanupAutoUpdate) {
    cleanupAutoUpdate()
    cleanupAutoUpdate = null
  }

  throttledUpdatePosition.cancel()
}

function updatePopoverMinWidth() {
  if (!wrapperRef.value || props.alignPoint) {
    return
  }

  if (!props.fillTriggerWidth) {
    wrapperRef.value.style.minWidth = ''
    return
  }

  const trigger = activeTriggerRef.value || triggerRef.value
  const triggerWidth = trigger.getBoundingClientRect().width
  const maxWidth = getCssUnitValue(props.maxWidth)

  wrapperRef.value.style.minWidth = maxWidth
    ? `min(${triggerWidth}px, ${maxWidth})`
    : `${triggerWidth}px`
}

function getPositionMiddleware() {
  return [
    shift({ padding: { left: 4, right: 4 } }),
    props.autoPosition && flip(),
    props.showArrow && arrow({ element: arrowRef.value }),
    props.closeOnInvisible && hide({ strategy: 'escaped' }),
    props.closeOnInvisible && hide({ strategy: 'referenceHidden' }),
  ]
}

async function updatePosition() {
  if (!wrapperRef.value) {
    return
  }

  const referenceElement = getReferenceElement()
  updatePopoverMinWidth()

  const { x, y, placement, middlewareData } = await computePosition(
    referenceElement,
    wrapperRef.value,
    {
      placement: props.position,
      middleware: getPositionMiddleware(),
    },
  )

  localPosition.value = placement

  if (!isManual.value && (middlewareData.hide?.referenceHidden || middlewareData.hide?.escaped)) {
    handlePopoverHide(true)
    return
  }

  const wrapperPositionStyle = {
    left: props.adaptive ? '0' : `${x}px`,
    top: props.adaptive ? '0' : `${y}px`,
  } as const

  Object.assign(wrapperRef.value.style, wrapperPositionStyle)

  if (middlewareData.arrow) {
    const { x: arrowX, y: arrowY } = middlewareData.arrow
    Object.assign(arrowRef.value.style, {
      left: arrowX != null ? `${Math.max(Math.ceil(arrowX), 5)}px` : '',
      top: arrowY != null ? `${Math.max(Math.ceil(arrowY), 5)}px` : '',
    })
  }
}
async function handlePopoverShow() {
  if (showPopoverTimer || props.disabled) {
    return
  }

  await new Promise<void>((resolve) => {
    clearHideTimer()

    showPopoverTimer = setTimeout(() => {
      showPopoverTimer = null
      resolve()
    }, props.showDelay)
  })

  // Position before the enter transition starts, while data-visible is still false.
  const visiblePromise = showPopover()
  await syncPosition()
  await visiblePromise
}

function handlePopoverEscape(ev: KeyboardEvent) {
  emits('escape', ev)

  if (!isManual.value) {
    handlePopoverHide()
  }
}

async function handlePopoverHide(immediate: boolean = false) {
  if (hidePopoverTimer) {
    if (!immediate) {
      return
    }

    clearHideTimer()
  }

  await new Promise<void>((resolve) => {
    clearShowTimer()

    hidePopoverTimer = setTimeout(
      () => {
        hidePopoverTimer = null
        resolve()
      },
      immediate ? 0 : props.hideDelay,
    )
  })

  clearTriggerElementsCache()
  disposeAutoUpdate()

  hidePopover()
}

function activateTrigger(trigger: HTMLElement, toggleSameTrigger: boolean = true) {
  const isSameTrigger = trigger === activeTriggerRef.value || !props.triggerSelector

  if (isVisible.value && isSameTrigger && toggleSameTrigger) {
    handlePopoverHide()
    return
  }

  if (isVisible.value) {
    updateActiveTrigger(trigger)
    return
  }

  setActiveTrigger(trigger)
  handlePopoverShow()
}

function updatePointerPosition(ev: PointerEvent) {
  pointerPosition.value = {
    x: ev.clientX,
    y: ev.clientY,
  }
}

function onTriggerClick(ev: Event) {
  if (props.disabled || isForeignTarget(ev.target)) {
    return
  }

  const trigger = resolveTriggerElement(ev.target)

  if (!trigger) {
    if (!isManual.value && props.closeOnOutsideClick && isVisible.value) {
      handlePopoverHide()
    }

    return
  }

  emits('trigger-click', ev as PointerEvent)

  if (triggerMethods.value.includes('click')) {
    if (triggerMethods.value.includes('hover') && isVisible.value) {
      return
    }

    if (props.alignPoint && !isVisible.value) {
      updatePointerPosition(ev as PointerEvent)
    }

    activateTrigger(trigger, props.toggleOnTrigger)
  } else if (
    props.alignPoint &&
    isVisible.value &&
    triggerMethods.value.includes('contextmenu') &&
    !triggerMethods.value.includes('hover')
  ) {
    handlePopoverHide()
  }
}

function onTriggerPointerOver(ev: PointerEvent) {
  if (props.disabled || !triggerMethods.value.includes('hover')) {
    return
  }

  if (isForeignTarget(ev.target)) {
    return
  }

  const trigger = resolveTriggerElement(ev.target)

  if (trigger) {
    if (props.alignPoint) {
      updatePointerPosition(ev)
    }

    activateTrigger(trigger, false)
  }
}

// pointerout bubbles, so it also covers what pointerleave used to handle.
function onTriggerPointerOut(ev: PointerEvent) {
  if (props.disabled || !triggerMethods.value.includes('hover')) {
    return
  }

  const next = ev.relatedTarget
  const isInside = next instanceof Node && triggerRef.value.contains(next)

  if (!isInside) {
    clearHideTimer()
    handlePopoverHide()
    return
  }

  // Still inside: only the gap between matched triggers gets a frame of grace.
  if (!props.triggerSelector || !resolveTriggerElement(ev.target) || resolveTriggerElement(next)) {
    return
  }

  hideOnNextFrame()
}

function onTriggerPointerMove(ev: PointerEvent) {
  if (props.disabled || !triggerMethods.value.includes('hover')) {
    return
  }

  if (!props.alignPoint) {
    return
  }

  updatePointerPosition(ev)

  if (isVisible.value) {
    updatePosition()
  }
}

function onTriggerContextmenu(ev: PointerEvent) {
  if (props.disabled || !triggerMethods.value.includes('contextmenu')) {
    return
  }

  if (isForeignTarget(ev.target)) {
    return
  }

  const trigger = resolveTriggerElement(ev.target)

  if (!trigger) {
    return
  }

  ev.preventDefault()

  if (props.alignPoint) {
    setActiveTrigger(trigger)
    updatePointerPosition(ev)

    if (isVisible.value) {
      throttledUpdatePosition()
    } else {
      handlePopoverShow()
    }

    return
  }

  activateTrigger(trigger)
}

function onWrapperKeydown(ev: KeyboardEvent) {
  if (props.disabled || !isVisible.value) {
    return
  }

  emits('wrapper-keydown', ev)
}

function onWrapperPointerEnter() {
  if (props.disabled) {
    return
  }

  if (!props.interactive || !isVisible.value) {
    return
  }

  handlePopoverShow()
}

function onWrapperPointerLeave() {
  if (props.disabled) {
    return
  }

  if (!triggerMethods.value.includes('hover')) {
    return
  }

  handlePopoverHide()
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      handlePopoverShow()
    } else {
      handlePopoverHide(true)
    }
  },
)

onMounted(() => {
  if (props.modelValue) {
    handlePopoverShow()
  }
})

onBeforeUnmount(() => {
  clearShowTimer()
  clearHideTimer()
  disposeAutoUpdate()
  clearTriggerElementsCache()
})

defineExpose({
  show: handlePopoverShow,
  hide: handlePopoverHide,
  update: throttledUpdatePosition,
})
</script>

<template>
  <div
    data-popover
    ref="triggerRef"
    class="pxd-popover inline-flex max-w-full touch-manipulation active:select-none data-[disabled=true]:pointer-events-none data-[visible=true]:pointer-events-auto"
    :data-visible="isVisible"
    :data-disabled="disabled"
    v-bind="$attrs"
    @click.capture="onTriggerClick"
    @contextmenu="onTriggerContextmenu"
    @pointerover="onTriggerPointerOver"
    @pointerout="onTriggerPointerOut"
    @pointermove="onTriggerPointerMove"
  >
    <slot />

    <POverlay
      v-if="isRender"
      :model-value="isVisible"
      :z-index="overlayZIndex"
      :variant="adaptive ? 'default' : 'none'"
      :close-on-press-escape="closeOnPressEscape"
      :lock-scroll-on-visible="lockScrollOnVisible"
      @escape="handlePopoverEscape"
    >
      <div
        ref="wrapperRef"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :data-visible="isVisible"
        :data-adaptive="adaptive"
        :data-position="localPosition"
        :data-interactive="interactive"
        :class="wrapperClass"
        :style="wrapperStyle"
        :aria-labelledby="ariaLabelledby"
        class="pxd-popover--wrapper sm:max-w-(--popover-max-width) absolute -top-full -left-full isolate z-(--popover-index) flex max-h-full max-w-full will-change-transform outline-none data-[interactive=false]:pointer-events-none data-[visible=false]:pointer-events-none data-[visible=false]:transition-none! motion-reduce:data-[visible=false]:hidden"
        @keydown="onWrapperKeydown"
        @pointerenter="onWrapperPointerEnter"
        @pointerleave="onWrapperPointerLeave"
      >
        <div
          class="pxd-popover--container pointer-events-none relative z-1 min-h-inherit w-full default-transition-duration default-transition-timing-function"
          :data-transition-type="adaptive ? 'fade-slide' : 'fade-scale'"
          :data-enter-motion="configProvider.enterMotion"
          :data-leave-motion="configProvider.leaveMotion"
        >
          <div
            class="pxd-popover--content h-full max-h-inherit overflow-auto"
            :class="contentClass"
            :style="contentStyle"
          >
            <slot
              name="content"
              :active-trigger="activeTriggerRef"
              :active-trigger-index="activeTriggerIndex"
            />
          </div>

          <div
            v-if="showArrow"
            ref="arrowRef"
            class="pxd-popover--arrow pointer-events-none absolute z-1"
          >
            <PPopoverArrow
              fill="var(--popover-arrow-color,transparent)"
              stroke="var(--popover-arrow-border,transparent)"
              :position="localPosition"
            />
          </div>
        </div>
      </div>
    </POverlay>
  </div>
</template>

<style lang="postcss">
.pxd-popover--wrapper {
  --popover-padding: calc(var(--popover-offset, 8) * 1px);
  --popover-origin: center;

  &[data-position='top'] {
    --popover-origin: center bottom;
  }

  &[data-position='top-start'] {
    --popover-origin: left bottom;
  }

  &[data-position='top-end'] {
    --popover-origin: right bottom;
  }

  &[data-position='bottom'] {
    --popover-origin: center top;
  }

  &[data-position='bottom-start'] {
    --popover-origin: left top;
  }

  &[data-position='bottom-end'] {
    --popover-origin: right top;
  }

  &[data-position='left'] {
    --popover-origin: right center;
  }

  &[data-position='left-start'] {
    --popover-origin: right top;
  }

  &[data-position='left-end'] {
    --popover-origin: right bottom;
  }

  &[data-position='right'] {
    --popover-origin: left center;
  }

  &[data-position='right-start'] {
    --popover-origin: left top;
  }

  &[data-position='right-end'] {
    --popover-origin: left bottom;
  }

  &[data-position^='top'] {
    &[data-adaptive='false'] {
      padding-bottom: var(--popover-padding);
    }

    .pxd-popover--arrow {
      bottom: -6px;
    }
  }

  &[data-position^='bottom'] {
    &[data-adaptive='false'] {
      padding-top: var(--popover-padding);
    }

    .pxd-popover--arrow {
      top: -6px;
    }
  }

  &[data-position^='left'] {
    &[data-adaptive='false'] {
      padding-right: var(--popover-padding);
    }

    .pxd-popover--arrow {
      right: -6px;
    }
  }

  &[data-position^='right'] {
    &[data-adaptive='false'] {
      padding-left: var(--popover-padding);
    }

    .pxd-popover--arrow {
      left: -6px;
    }
  }

  .pxd-popover--content.variant-invert + .pxd-popover--arrow {
    --popover-arrow-border: var(--color-gray-300);
  }

  .pxd-popover--container {
    transition-property: opacity, transform;
    transform-origin: var(--popover-origin);
    max-height: min(800px, 80vh);
    max-height: min(800px, 80dvh);
  }

  &[data-visible='true'] .pxd-popover--container {
    opacity: 1;
    pointer-events: auto;
  }

  &[data-visible='false'] .pxd-popover--container[data-transition-type='fade-scale'] {
    opacity: 0;
    transform: scale(var(--popover-scale));
    transition-duration: var(--faster-transition-duration);
  }

  &[data-visible='false'] .pxd-popover--container[data-transition-type='fade-slide'] {
    transform: translateY(100%);
    transition-duration: var(--faster-transition-duration);
  }
}
</style>
