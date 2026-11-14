import type { ComponentPosition } from '../../types/shared/props'
import type { VirtualElement } from '@floating-ui/dom'
import type { CSSProperties, Ref, ShallowRef } from 'vue'
import { arrow, autoUpdate, computePosition, flip, hide, shift } from '@floating-ui/dom'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { caf, raf, throttleByRaf } from '../../utils/event.js'
import { getCssUnitValue, isTruthyProp, toArray } from '../../utils/format.js'
import { getUniqueId } from '../../utils/helper.js'
import { useDelayDestroy } from '../use-delay-destroy.js'
import { useOutsideClick } from '../use-outside-click.js'

export type PopupTrigger = 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual'

export interface PopupOptions {
  alignPoint?: boolean
  adaptive?: boolean
  arrowColor?: string
  autoFocusElement?: string | boolean
  autoPosition?: boolean
  closeOnInvisible?: boolean
  closeOnOutsideClick?: boolean
  contentRole?: string
  destroyDelay?: number
  disabled?: boolean
  fillTriggerWidth?: boolean
  hideDelay?: number
  interactive?: boolean
  maxWidth?: number | string
  modelValue?: boolean
  offset?: number
  position?: ComponentPosition
  showArrow?: boolean
  showDelay?: number
  toggleOnTrigger?: boolean
  trigger?: PopupTrigger | PopupTrigger[]
  triggerSelector?: string
  zIndex?: number | string
}

export interface PopupEngineEmits {
  (event: 'visible-change', visible: boolean): void
  (event: 'show'): void
  (event: 'hide'): void
  (event: 'update:model-value', visible: boolean): void
  (event: 'escape', ev: KeyboardEvent): void
  (event: 'outside-click', ev: PointerEvent): void
  (event: 'trigger-click', ev: PointerEvent): void
  (event: 'wrapper-keydown', ev: KeyboardEvent): void
}

export interface PopupEngineOptions {
  props: PopupOptions
  emits: PopupEngineEmits
  triggerRef: Ref<HTMLElement>
  wrapperRef: Ref<HTMLElement>
  arrowRef: Ref<HTMLElement>
}

/**
 * Shared popup engine: trigger registry and events, show/hide timers, outside-click
 * dismissal, floating-ui positioning and trigger aria relationships. Popover presets
 * (tooltip, select, menu, …) only add their own overlay, trap and markup on top.
 */
export function usePopupEngine({
  props,
  emits,
  triggerRef,
  wrapperRef,
  arrowRef,
}: PopupEngineOptions): {
  contentId: string
  isRender: Ref<boolean>
  isVisible: Ref<boolean>
  isRevealed: Ref<boolean>
  isManual: Ref<boolean>
  triggerMethods: Ref<PopupTrigger[]>
  focusTrapContainer: Ref<HTMLElement | null>
  activeTriggerRef: ShallowRef<HTMLElement | null>
  activeTriggerIndex: Ref<number>
  localPosition: Ref<ComponentPosition | undefined>
  wrapperTransform: Ref<string>
  wrapperStyle: Ref<CSSProperties>
  handlePopoverShow: () => Promise<void>
  handlePopoverHide: (immediate?: boolean) => Promise<void>
  handlePopoverEscape: (ev: KeyboardEvent) => void
  throttledUpdatePosition: (() => void) & { cancel: () => void }
  onTriggerClick: (ev: Event) => void
  onTriggerContextmenu: (ev: PointerEvent) => void
  onTriggerFocusIn: (ev: FocusEvent) => void
  onTriggerFocusOut: (ev: FocusEvent) => void
  onTriggerPointerOver: (ev: PointerEvent) => void
  onTriggerPointerOut: (ev: PointerEvent) => void
  onTriggerPointerMove: (ev: PointerEvent) => void
  onWrapperKeydown: (ev: KeyboardEvent) => void
  onWrapperPointerEnter: () => void
  onWrapperPointerLeave: () => void
} {
  // The layer is fixed, so its box never joins the document's scrollable overflow — no pre-reveal
  // frame can flash a page scrollbar — and it stays at the origin, moving by transform only, which
  // also keeps its width independent of where it lands.
  const HIDDEN_TRANSFORM = 'translate(0, -200%)'

  const contentId = getUniqueId()

  let showPopoverTimer: ReturnType<typeof setTimeout> | null = null
  let hidePopoverTimer: ReturnType<typeof setTimeout> | null = null
  let hideFrame = 0
  let triggerElements: HTMLElement[] | null = null
  let cleanupAutoUpdate: (() => void) | null = null
  const throttledUpdatePosition = throttleByRaf(updatePosition)

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

  const positionReady = shallowRef(false)
  const localPosition = shallowRef(props.position)
  const wrapperTransform = shallowRef(HIDDEN_TRANSFORM)
  const triggerMethods = computed<PopupTrigger[]>(() => toArray(props.trigger))
  const isManual = computed(() => triggerMethods.value.includes('manual'))
  // Everything visible or interactive waits for the first position: the reveal, the overlay and the
  // focus trap all hang off this one flag.
  const isRevealed = computed(() => isVisible.value && positionReady.value)
  const wrapperStyle = computed<CSSProperties>(() => ({
    '--popover-index': props.zIndex,
    '--popover-offset': props.offset,
    '--popover-arrow-color': props.arrowColor,
    // An unset var resolves `sm:max-w-(--popover-max-width)` to `none`, dropping the viewport cap.
    '--popover-max-width': getCssUnitValue(props.maxWidth, '100%'),
    left: 0,
    top: 0,
    transform: wrapperTransform.value,
  }))
  // Hover popovers must not steal focus; click ones trap Tab but only focus on request.
  const focusTrapContainer = computed(() =>
    isRevealed.value &&
    (isTruthyProp(props.autoFocusElement) || triggerMethods.value.includes('click'))
      ? wrapperRef.value
      : null,
  )

  const {
    render: isRender,
    visible: isVisible,
    show: showPopover,
    hide: hidePopover,
  } = useDelayDestroy(props.modelValue, {
    delay: () => props.destroyDelay ?? 0,
    visibleChange(v) {
      if (isManual.value) {
        return
      }

      emits('visible-change', v)

      if (v) {
        emits('show')
        emits('update:model-value', true)
      } else {
        emits('hide')
        emits('update:model-value', false)
      }
    },
  })

  useOutsideClick(wrapperRef, {
    // Judged on the press, not the browser's click: a drag that starts inside must not dismiss.
    eventName: 'pointerdown',
    allowList: [triggerRef, wrapperRef],
    enabled: () => isVisible.value,
    onTrigger: (ev) => {
      emits('outside-click', ev)

      if (!isManual.value && props.closeOnOutsideClick) {
        void handlePopoverHide()
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
    caf(hideFrame)
    hideFrame = 0

    if (hidePopoverTimer) {
      clearTimeout(hidePopoverTimer)
      hidePopoverTimer = null
    }
  }
  // One frame of grace lets a pointer crossing the gap between matched triggers reach the next one.
  function hideOnNextFrame() {
    if (hideFrame) {
      return
    }

    hideFrame = raf(() => {
      hideFrame = 0
      void handlePopoverHide()
    })
  }

  function getTriggerElements() {
    if (!props.triggerSelector) {
      return []
    }

    if (!triggerElements) {
      triggerElements = Array.from(
        triggerRef.value.querySelectorAll<HTMLElement>(props.triggerSelector),
      )
    }

    return triggerElements
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
      void handlePopoverHide()
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

  function syncWidth() {
    const wrapper = wrapperRef.value

    if (!wrapper) {
      return
    }

    const triggerWidth = (activeTriggerRef.value || triggerRef.value).getBoundingClientRect().width
    wrapper.style.setProperty('--popover-trigger-width', `${triggerWidth}px`)

    if (props.alignPoint || !props.fillTriggerWidth) {
      wrapper.style.minWidth = ''
      return
    }

    const maxWidth = getCssUnitValue(props.maxWidth)

    wrapper.style.minWidth = maxWidth ? `min(${triggerWidth}px, ${maxWidth})` : `${triggerWidth}px`
  }

  function roundByDPR(value: number) {
    const dpr = window.devicePixelRatio || 1

    return Math.round(value * dpr) / dpr
  }

  function getPositionMiddleware() {
    return [
      props.autoPosition && flip(),
      shift({ padding: 4, crossAxis: true }),
      props.showArrow && arrow({ element: arrowRef.value }),
      props.closeOnInvisible && hide({ strategy: 'escaped' }),
      props.closeOnInvisible && hide({ strategy: 'referenceHidden' }),
    ]
  }

  async function updatePosition() {
    if (!wrapperRef.value) {
      return
    }

    syncWidth()

    const { x, y, placement, middlewareData } = await computePosition(
      getReferenceElement(),
      wrapperRef.value,
      {
        strategy: 'fixed',
        placement: props.position,
        middleware: getPositionMiddleware(),
      },
    )

    // The open-time compute runs pre-reveal, where a still parked layer reads as escaped; only a
    // revealed popover may close itself.
    if (
      !isManual.value &&
      isRevealed.value &&
      (middlewareData.hide?.referenceHidden || middlewareData.hide?.escaped)
    ) {
      void handlePopoverHide(true)
      return
    }

    const transform = props.adaptive ? '' : `translate(${roundByDPR(x)}px, ${roundByDPR(y)}px)`

    // autoUpdate computes several times per open (its own first call, resize observer, scroll); only
    // a changed result is worth touching the DOM.
    if (transform === wrapperTransform.value && placement === localPosition.value) {
      return
    }

    localPosition.value = placement
    wrapperTransform.value = transform

    if (middlewareData.arrow) {
      const { x: arrowX, y: arrowY } = middlewareData.arrow
      Object.assign(arrowRef.value.style, {
        left: arrowX != null ? `${Math.max(Math.ceil(arrowX), 5)}px` : '',
        top: arrowY != null ? `${Math.max(Math.ceil(arrowY), 5)}px` : '',
      })
    }
  }

  function startAutoUpdate() {
    if (!props.autoPosition || !wrapperRef.value) {
      return
    }

    cleanupAutoUpdate = autoUpdate(getReferenceElement(), wrapperRef.value, throttledUpdatePosition)
  }

  function disposeAutoUpdate() {
    if (cleanupAutoUpdate) {
      cleanupAutoUpdate()
      cleanupAutoUpdate = null
    }

    throttledUpdatePosition.cancel()
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

  async function handlePopoverShow() {
    if (showPopoverTimer || props.disabled) {
      return
    }

    clearHideTimer()

    // Fully shown and tracked: a modelValue echo must not restart the position sync.
    if (isRevealed.value && cleanupAutoUpdate) {
      return
    }

    await new Promise<void>((resolve) => {
      showPopoverTimer = setTimeout(() => {
        showPopoverTimer = null
        resolve()
      }, props.showDelay)
    })

    // Position before the enter transition starts, while data-visible is still false.
    if (!isVisible.value) {
      positionReady.value = false
      wrapperTransform.value = HIDDEN_TRANSFORM
    }

    const visiblePromise = showPopover()
    await syncPosition()
    positionReady.value = true
    await visiblePromise
  }

  function handlePopoverEscape(ev: KeyboardEvent) {
    emits('escape', ev)

    if (!isManual.value) {
      void handlePopoverHide()
    }
  }

  async function handlePopoverHide(immediate: boolean = false) {
    if (hidePopoverTimer) {
      if (!immediate) {
        return
      }

      clearHideTimer()
    }

    clearShowTimer()

    await new Promise<void>((resolve) => {
      hidePopoverTimer = setTimeout(
        () => {
          hidePopoverTimer = null
          resolve()
        },
        immediate ? 0 : props.hideDelay,
      )
    })

    triggerElements = null
    disposeAutoUpdate()

    void hidePopover()
  }

  function activateTrigger(trigger: HTMLElement, toggleSameTrigger: boolean = true) {
    const isSameTrigger = trigger === activeTriggerRef.value || !props.triggerSelector

    if (isVisible.value && isSameTrigger && toggleSameTrigger) {
      void handlePopoverHide()
      return
    }

    if (isVisible.value) {
      void updateActiveTrigger(trigger)
      return
    }

    setActiveTrigger(trigger)
    void handlePopoverShow()
  }

  function updatePointerPosition(ev: PointerEvent) {
    pointerPosition.value = { x: ev.clientX, y: ev.clientY }
  }

  function onTriggerClick(ev: Event) {
    if (props.disabled || isForeignTarget(ev.target)) {
      return
    }

    const trigger = resolveTriggerElement(ev.target)

    if (!trigger) {
      if (!isManual.value && props.closeOnOutsideClick && isVisible.value) {
        void handlePopoverHide()
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
      void handlePopoverHide()
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
      // Focus may still rest on the trigger or the content even after the pointer left.
      if (
        triggerMethods.value.includes('focus') &&
        (triggerRef.value.contains(document.activeElement) ||
          wrapperRef.value?.contains(document.activeElement))
      ) {
        return
      }

      clearHideTimer()
      void handlePopoverHide()
      return
    }

    // Still inside: only the gap between matched triggers gets a frame of grace.
    if (
      !props.triggerSelector ||
      !resolveTriggerElement(ev.target) ||
      resolveTriggerElement(next)
    ) {
      return
    }

    hideOnNextFrame()
  }

  function onTriggerPointerMove(ev: PointerEvent) {
    if (props.disabled || !triggerMethods.value.includes('hover') || !props.alignPoint) {
      return
    }

    updatePointerPosition(ev)

    if (isVisible.value) {
      throttledUpdatePosition()
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
        void handlePopoverShow()
      }

      return
    }

    activateTrigger(trigger)
  }

  function onTriggerFocusIn(ev: FocusEvent) {
    if (props.disabled || !triggerMethods.value.includes('focus')) {
      return
    }

    if (isForeignTarget(ev.target)) {
      return
    }

    const trigger = resolveTriggerElement(ev.target)

    if (trigger) {
      activateTrigger(trigger, false)
    }
  }

  function onTriggerFocusOut(ev: FocusEvent) {
    if (props.disabled || !triggerMethods.value.includes('focus')) {
      return
    }

    const next = ev.relatedTarget

    if (
      next instanceof Node &&
      (triggerRef.value.contains(next) || wrapperRef.value?.contains(next))
    ) {
      return
    }

    void handlePopoverHide()
  }

  function onWrapperKeydown(ev: KeyboardEvent) {
    if (props.disabled || !isVisible.value) {
      return
    }

    emits('wrapper-keydown', ev)
  }

  function onWrapperPointerEnter() {
    if (props.disabled || !props.interactive || !isVisible.value) {
      return
    }

    void handlePopoverShow()
  }

  function onWrapperPointerLeave() {
    if (props.disabled || !triggerMethods.value.includes('hover')) {
      return
    }

    void handlePopoverHide()
  }

  function syncTriggerAria() {
    const triggers = props.triggerSelector ? getTriggerElements() : [triggerRef.value]
    const isTooltip = props.contentRole === 'tooltip'

    for (const trigger of triggers) {
      if (!trigger) {
        continue
      }

      if (isTooltip) {
        if (isVisible.value) {
          trigger.setAttribute('aria-describedby', contentId)
        } else {
          trigger.removeAttribute('aria-describedby')
        }

        continue
      }

      trigger.setAttribute('aria-haspopup', 'dialog')
      trigger.setAttribute(
        'aria-expanded',
        String(isVisible.value && trigger === activeTriggerRef.value),
      )
    }
  }

  watch(
    () => props.modelValue,
    (visible) => {
      if (visible) {
        void handlePopoverShow()
      } else {
        void handlePopoverHide(true)
      }
    },
  )

  watch([isVisible, activeTriggerRef], syncTriggerAria, { flush: 'post' })

  onMounted(() => {
    if (props.modelValue) {
      void handlePopoverShow()
    }
  })

  onBeforeUnmount(() => {
    clearShowTimer()
    clearHideTimer()
    disposeAutoUpdate()
    triggerElements = null
  })

  return {
    contentId,
    isRender,
    isVisible,
    isRevealed,
    isManual,
    triggerMethods,
    focusTrapContainer,
    activeTriggerRef,
    activeTriggerIndex,
    localPosition,
    wrapperTransform,
    wrapperStyle,
    handlePopoverShow,
    handlePopoverHide,
    handlePopoverEscape,
    throttledUpdatePosition,
    onTriggerClick,
    onTriggerContextmenu,
    onTriggerFocusIn,
    onTriggerFocusOut,
    onTriggerPointerOver,
    onTriggerPointerOut,
    onTriggerPointerMove,
    onWrapperKeydown,
    onWrapperPointerEnter,
    onWrapperPointerLeave,
  }
}
