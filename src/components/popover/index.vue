<script lang="ts" setup>
import type { PopoverEmits, PopoverProps, PopoverTrigger } from './types'
import type { VirtualElement } from '@floating-ui/dom'
import type { CSSProperties } from 'vue'
import { arrow, autoUpdate, computePosition, flip, shift, hide } from '@floating-ui/dom'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useDelayDestroy } from '../../composables/use-delay-destroy.js'
import { useFocusTrap } from '../../composables/use-focus-trap.js'
import { useOutsideClick } from '../../composables/use-outside-click.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { throttleByRaf } from '../../utils/event.js'
import { getCssUnitValue, toArray } from '../../utils/format.js'
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
  toggleOnTrigger: true,
  closeOnInvisible: true,
  closeOnPressEscape: true,
})

const emits = defineEmits<PopoverEmits>()

let showPopoverTimer: ReturnType<typeof setTimeout> | null
let hidePopoverTimer: ReturnType<typeof setTimeout> | null
let triggerElementsCache: HTMLElement[] | null = null
let cleanupAutoUpdate: (() => void) | null = null

const arrowRef = shallowRef<HTMLElement>(null!)
const triggerRef = shallowRef<HTMLElement>(null!)
const wrapperRef = shallowRef<HTMLElement>(null!)
const activeTriggerRef = shallowRef<HTMLElement | null>(null)
const activeTriggerIndex = shallowRef(-1)
const hasMultipleTriggers = shallowRef(false)
const pointerPosition = shallowRef<{ x: number; y: number } | null>(null)
const localPosition = shallowRef(props.position)
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

const triggerMethods = computed<PopoverTrigger[]>(() => toArray(props.trigger))
const transitionType = computed(() => (props.adaptive ? 'fade-slide' : 'fade-scale'))
const popoverMaxWidth = computed(() => getCssUnitValue(props.maxWidth))
const wrapperStyle = computed<CSSProperties>(() => ({
  '--popover-index': props.zIndex,
  '--popover-offset': props.offset,
  '--popover-arrow-color': props.arrowColor,
  '--popover-max-width': popoverMaxWidth.value,
}))

const configProvider = useConfigProvider()

const allowOutsideClick = computed(() => !triggerMethods.value.includes('manual'))
const focusTrapContainer = computed(() => (isVisible.value ? wrapperRef.value : null))
const triggerPointerMoveFn = computed(() => (props.alignPoint ? onTriggerPointerMove : undefined))
const computePositionMiddleware = computed(() => {
  return [
    shift(),
    props.autoPosition && flip(),
    props.showArrow && arrow({ element: arrowRef.value }),
    props.closeOnInvisible && hide({ strategy: 'escaped' }),
    props.closeOnInvisible && hide({ strategy: 'referenceHidden' }),
  ]
})

const {
  render: isRender,
  visible: isVisible,
  show: showPopover,
  hide: hidePopover,
} = useDelayDestroy(props.modelValue, {
  visibleChange(v) {
    if (!allowOutsideClick.value) {
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

useFocusTrap(focusTrapContainer)

useOutsideClick(wrapperRef, {
  allowList: [triggerRef, wrapperRef],
  isEnabled: () => {
    return isVisible.value && allowOutsideClick.value
  },
  onTrigger: (ev) => {
    emits('outside-click', ev)

    if (allowOutsideClick.value) {
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

function clearHideTimer() {
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

    hasMultipleTriggers.value = triggerElementsCache.length > 0
  }

  return triggerElementsCache
}

function clearTriggerElementsCache() {
  triggerElementsCache = null
  hasMultipleTriggers.value = false
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

async function syncPosition(waitForDom: boolean = false) {
  disposeAutoUpdate()

  if (waitForDom) {
    await nextTick()
  }

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
    await syncPosition(true)
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

  const trigger = activeTriggerRef.value || triggerRef.value
  const triggerWidth = trigger.getBoundingClientRect().width
  const maxWidth = popoverMaxWidth.value

  wrapperRef.value.style.minWidth = maxWidth
    ? `min(${triggerWidth}px, ${maxWidth})`
    : `${triggerWidth}px`
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
      middleware: computePositionMiddleware.value,
    },
  )

  localPosition.value = placement

  if (middlewareData.hide?.referenceHidden || middlewareData.hide?.escaped) {
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

const throttledUpdatePosition = throttleByRaf(updatePosition)

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

  // Render first, then position the wrapper while it is still invisible
  // (transitions are disabled via CSS when data-visible is false), so the
  // enter animation always starts from the correct position.
  const visiblePromise = showPopover()
  await syncPosition(true)
  await visiblePromise
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
  if (props.disabled) {
    return
  }

  const trigger = resolveTriggerElement(ev.target)

  if (!trigger) {
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

  const trigger = resolveTriggerElement(ev.target)

  if (trigger) {
    if (props.alignPoint) {
      updatePointerPosition(ev)
    }

    activateTrigger(trigger, false)
  }
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

function onTriggerPointerLeave() {
  if (props.disabled || !triggerMethods.value.includes('hover')) {
    return
  }

  handlePopoverHide()
}

function onTriggerContextmenu(ev: PointerEvent) {
  if (props.disabled || !triggerMethods.value.includes('contextmenu')) {
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
    ref="triggerRef"
    class="pxd-popover inline-flex max-w-full touch-manipulation active:select-none data-[disabled=true]:pointer-events-none data-[visible=true]:pointer-events-auto"
    :data-visible="isVisible"
    :data-disabled="disabled"
    v-bind="$attrs"
    @click="onTriggerClick"
    @contextmenu="onTriggerContextmenu"
    @pointerover="onTriggerPointerOver"
    @pointermove="triggerPointerMoveFn"
    @pointerleave="onTriggerPointerLeave"
  >
    <slot />

    <POverlay
      :model-value="isVisible"
      :show-overlay="adaptive"
      :close-on-press-escape="closeOnPressEscape"
      :lock-scroll-on-visible="adaptive"
      @escape="handlePopoverHide()"
    >
      <div
        v-if="isRender"
        ref="wrapperRef"
        tabindex="-1"
        :data-visible="isVisible"
        :data-adaptive="adaptive"
        :data-position="localPosition"
        :data-interactive="interactive"
        :data-multiple-triggers="hasMultipleTriggers"
        :class="wrapperClass"
        :style="wrapperStyle"
        class="pxd-popover--wrapper sm:max-w-(--popover-max-width) absolute -top-full -left-full isolate z-(--popover-index) flex max-h-full max-w-full outline-none data-[interactive=false]:pointer-events-none data-[multiple-triggers=true]:transition-[left,top] data-[visible=false]:pointer-events-none data-[visible=false]:transition-none! motion-reduce:data-[visible=false]:hidden"
        @keydown="onWrapperKeydown"
        @pointerenter="onWrapperPointerEnter"
        @pointerleave="onWrapperPointerLeave"
      >
        <div
          class="pxd-popover--container pointer-events-none relative z-1 min-h-inherit w-inherit default-transition-duration default-transition-timing-function"
          :data-transition-type="transitionType"
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
            class="pxd-popover--arrow pointer-events-none absolute z-1 will-change-[left,top]"
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

  .pxd-popover--content.border + .pxd-popover--arrow {
    --popover-arrow-border: var(--color-gray-300);
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
}

.pxd-popover--container {
  transition-property: opacity, transform;
  max-height: min(800px, 80vh);
  max-height: min(800px, 80dvh);

  [data-visible='true'] & {
    opacity: 1;
    pointer-events: auto;
  }

  [data-visible='false'] &[data-transition-type='fade-scale'] {
    opacity: 0;
    transform: scale(var(--popover-scale));
    transition-duration: var(--faster-transition-duration);
  }

  [data-visible='false'] &[data-transition-type='fade-slide'] {
    transform: translateY(100%);
    transition-duration: var(--faster-transition-duration);
  }

  [data-position='top'] & {
    transform-origin: center bottom;
  }

  [data-position='top-start'] & {
    transform-origin: left bottom;
  }

  [data-position='top-end'] & {
    transform-origin: right bottom;
  }

  [data-position='bottom'] & {
    transform-origin: center top;
  }

  [data-position='bottom-start'] & {
    transform-origin: left top;
  }

  [data-position='bottom-end'] & {
    transform-origin: right top;
  }

  [data-position='left'] & {
    transform-origin: right center;
  }

  [data-position='left-start'] & {
    transform-origin: right top;
  }

  [data-position='left-end'] & {
    transform-origin: right bottom;
  }

  [data-position='right'] & {
    transform-origin: left center;
  }

  [data-position='right-start'] & {
    transform-origin: left top;
  }

  [data-position='right-end'] & {
    transform-origin: left bottom;
  }
}
</style>
