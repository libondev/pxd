import type { ComponentPosition } from '../../types/shared/props'
import type { VirtualElement } from '@floating-ui/dom'
import type { CSSProperties, MaybeRefOrGetter, Ref, ShallowRef } from 'vue'
import { arrow, autoUpdate, computePosition, flip, hide, shift, size } from '@floating-ui/dom'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, toValue, watch } from 'vue'
import { caf, raf, throttleByRaf } from '../../utils/event.js'
import { getCssUnitValue, isTruthyProp, toArray } from '../../utils/format.js'
import { getUniqueId } from '../../utils/helper.js'
import { useDelayDestroy } from '../use-delay-destroy.js'
import { useOutsideClick } from '../use-outside-click.js'

export type PopupTrigger = 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual'

export interface PopupOptions {
  alignPoint?: MaybeRefOrGetter<boolean | undefined>
  ariaTarget?: MaybeRefOrGetter<HTMLElement | null | undefined>
  arrowColor?: MaybeRefOrGetter<string | undefined>
  autoFocusElement?: MaybeRefOrGetter<string | boolean | undefined>
  autoPosition?: MaybeRefOrGetter<boolean | undefined>
  closeOnInvisible?: MaybeRefOrGetter<boolean | undefined>
  closeOnOutsideClick?: MaybeRefOrGetter<boolean | undefined>
  contentRole?: MaybeRefOrGetter<string | undefined>
  destroyDelay?: MaybeRefOrGetter<number | undefined>
  disabled?: MaybeRefOrGetter<boolean | undefined>
  hideDelay?: MaybeRefOrGetter<number | undefined>
  interactive?: MaybeRefOrGetter<boolean | undefined>
  matchReferenceWidth?: MaybeRefOrGetter<boolean | undefined>
  maxHeight?: MaybeRefOrGetter<number | string | undefined>
  maxWidth?: MaybeRefOrGetter<number | string | undefined>
  modelValue?: MaybeRefOrGetter<boolean | undefined>
  offset?: MaybeRefOrGetter<number | undefined>
  position?: MaybeRefOrGetter<ComponentPosition | undefined>
  sheet?: MaybeRefOrGetter<boolean | undefined>
  showArrow?: MaybeRefOrGetter<boolean | undefined>
  showDelay?: MaybeRefOrGetter<number | undefined>
  stableHeight?: MaybeRefOrGetter<boolean | undefined>
  toggleOnTrigger?: MaybeRefOrGetter<boolean | undefined>
  trigger?: MaybeRefOrGetter<PopupTrigger | PopupTrigger[] | undefined>
  triggerSelector?: MaybeRefOrGetter<string | undefined>
  zIndex?: MaybeRefOrGetter<number | string | undefined>
}

export interface PopupEngineCallbacks {
  onVisibleChange?: (visible: boolean) => void
  onShow?: () => void
  onHide?: () => void
  onUpdateModelValue?: (visible: boolean) => void
  onEscape?: (ev: KeyboardEvent) => void
  onOutsideClick?: (ev: PointerEvent) => void
  onTriggerClick?: (ev: PointerEvent) => void
  onWrapperKeydown?: (ev: KeyboardEvent) => void
}

export interface PopupEngineOptions extends PopupOptions, PopupEngineCallbacks {
  triggerRef: Ref<HTMLElement | null>
  wrapperRef: Ref<HTMLElement>
  containerRef: Ref<HTMLElement>
  arrowRef: Ref<HTMLElement>
}

// What holds the panel at the height it was given, readable in devtools: `stable` is the height it
// keeps while its list filters, `space` the room around it, and `content` neither — no height was
// applied at all. Panels that never carry a height of their own stay unmarked.
function markSizeLimit(wrapper: HTMLElement, value: 'space' | 'stable' | 'content') {
  if (wrapper.dataset.sizeLimit !== value) {
    wrapper.dataset.sizeLimit = value
  }
}

export function usePopupEngine(options: PopupEngineOptions): {
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
  const { triggerRef, wrapperRef, containerRef, arrowRef } = options

  // The layer is fixed, so its box never joins the document's scrollable overflow — no pre-reveal
  // frame can flash a page scrollbar — and it stays at the origin, moving by transform only, which
  // also keeps its width independent of where it lands.
  const HIDDEN_TRANSFORM = 'translate(0, -200%)'

  const contentId = getUniqueId()

  let showPopoverTimer: ReturnType<typeof setTimeout> | null = null
  let hidePopoverTimer: ReturnType<typeof setTimeout> | null = null
  let showPopoverResolve: ((shown: boolean) => void) | null = null
  let hidePopoverResolve: ((hidden: boolean) => void) | null = null
  let hideFrame = 0
  let triggerElements: HTMLElement[] | null = null
  let triggerElementsSelector: string | undefined
  let cleanupAutoUpdate: (() => void) | null = null
  let positionSeq = 0
  let stablePadding: number | null = null
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
  const lockedHeight = shallowRef(0)
  const localPosition = shallowRef(toValue(options.position))
  const wrapperTransform = shallowRef(HIDDEN_TRANSFORM)
  const triggerMethods = computed<PopupTrigger[]>(() => toArray(toValue(options.trigger)))
  const isManual = computed(() => triggerMethods.value.includes('manual'))
  // Everything visible or interactive waits for the first position: the reveal, the overlay and the
  // focus trap all hang off this one flag.
  const isRevealed = computed(() => isVisible.value && positionReady.value)
  const wrapperStyle = computed<CSSProperties>(() => ({
    '--popover-index': toValue(options.zIndex),
    '--popover-offset': toValue(options.offset),
    '--popover-arrow-color': toValue(options.arrowColor),
    // An unset var resolves `sm:max-w-(--popover-max-width)` to `none`, dropping the viewport cap.
    '--popover-max-width': getCssUnitValue(toValue(options.maxWidth), '100%'),
    // The design ceiling, folded with the space cap by the wrapper's own `max-height`.
    '--popover-max-height': getCssUnitValue(toValue(options.maxHeight), 'min(50rem, 80dvh)'),
    left: 0,
    top: 0,
    transform: wrapperTransform.value,
  }))
  // Hover popovers must not steal focus; click ones trap Tab but only focus on request.
  const focusTrapContainer = computed(() =>
    isRevealed.value &&
    (isTruthyProp(toValue(options.autoFocusElement)) || triggerMethods.value.includes('click'))
      ? wrapperRef.value
      : null,
  )

  const {
    render: isRender,
    visible: isVisible,
    show: showPopover,
    hide: hidePopover,
  } = useDelayDestroy(() => toValue(options.modelValue), {
    delay: () => toValue(options.destroyDelay) ?? 0,
    visibleChange(v) {
      if (isManual.value) {
        return
      }

      options.onVisibleChange?.(v)

      if (v) {
        options.onShow?.()
        options.onUpdateModelValue?.(true)
      } else {
        options.onHide?.()
        options.onUpdateModelValue?.(false)
      }
    },
  })

  useOutsideClick(wrapperRef, {
    // Judged on the press, not the browser's click: a drag that starts inside must not dismiss.
    eventName: 'pointerdown',
    allowList: [triggerRef, wrapperRef],
    enabled: () => isVisible.value,
    onTrigger: (ev) => {
      options.onOutsideClick?.(ev)

      if (!isManual.value && toValue(options.closeOnOutsideClick)) {
        void handlePopoverHide()
      }
    },
  })

  function clearShowTimer() {
    if (showPopoverTimer) {
      clearTimeout(showPopoverTimer)
      showPopoverTimer = null
    }

    // Wake a cancelled delay instead of leaving its caller parked on a promise forever.
    showPopoverResolve?.(false)
    showPopoverResolve = null
  }

  function clearHideTimer() {
    caf(hideFrame)
    hideFrame = 0

    if (hidePopoverTimer) {
      clearTimeout(hidePopoverTimer)
      hidePopoverTimer = null
    }

    hidePopoverResolve?.(false)
    hidePopoverResolve = null
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

  function getTriggerElements(): HTMLElement[] {
    const selector = toValue(options.triggerSelector)

    if (!selector) {
      return []
    }

    if (!triggerRef.value) {
      return []
    }

    if (!triggerElements || triggerElementsSelector !== selector) {
      triggerElements = Array.from(triggerRef.value.querySelectorAll<HTMLElement>(selector))
      triggerElementsSelector = selector
    }

    return triggerElements
  }

  function resolveTriggerElement(target: EventTarget | null): HTMLElement | null {
    const selector = toValue(options.triggerSelector)

    if (!selector) {
      return triggerRef.value
    }

    if (!(target instanceof Element) || !triggerRef.value) {
      return null
    }

    const matched = target.closest<HTMLElement>(selector)

    if (!matched || !triggerRef.value.contains(matched)) {
      return null
    }

    return matched
  }
  // Capture phase makes the nearest popover own the event; an ignored subtree owns none, and
  // leaving it must not close the popover that owns it.
  function closeIfForeign(target: EventTarget | null) {
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

  function isTriggerMethod(method: PopupTrigger): boolean {
    return !toValue(options.disabled) && triggerMethods.value.includes(method)
  }

  function resolveTrigger(ev: Event): HTMLElement | null {
    if (closeIfForeign(ev.target)) {
      return null
    }

    return resolveTriggerElement(ev.target)
  }

  function setActiveTrigger(trigger: HTMLElement | null) {
    activeTriggerRef.value = trigger

    if (!toValue(options.triggerSelector)) {
      activeTriggerIndex.value = 0
      return
    }

    activeTriggerIndex.value = trigger ? getTriggerElements().indexOf(trigger) : -1
  }

  function ensureActiveTrigger() {
    if (!toValue(options.triggerSelector)) {
      // A single trigger is the element the caller rendered, which `as-child` may replace on any
      // re-render; keep the reference on the live node instead of the one first resolved.
      if (activeTriggerRef.value !== triggerRef.value) {
        setActiveTrigger(triggerRef.value)
      }

      return
    }

    if (!activeTriggerRef.value || !triggerRef.value?.contains(activeTriggerRef.value)) {
      setActiveTrigger(getTriggerElements()[0] ?? null)
    }
  }

  function getReferenceElement(): HTMLElement | VirtualElement {
    if (toValue(options.alignPoint) && pointerPosition.value) {
      return pointReference
    }

    ensureActiveTrigger()

    // Callers only position once a trigger exists; the fallback keeps the type honest.
    return activeTriggerRef.value || triggerRef.value!
  }

  function syncWidth() {
    const wrapper = wrapperRef.value

    if (!wrapper) {
      return
    }

    // The active trigger may still name the element this `as-child` child replaced.
    ensureActiveTrigger()

    const trigger = activeTriggerRef.value || triggerRef.value

    if (!trigger) {
      return
    }

    const triggerWidth = trigger.getBoundingClientRect().width
    wrapper.style.setProperty('--popover-trigger-width', `${triggerWidth}px`)

    if (toValue(options.alignPoint) || !toValue(options.matchReferenceWidth)) {
      wrapper.style.minWidth = ''
      return
    }

    const maxWidth = getCssUnitValue(toValue(options.maxWidth))

    wrapper.style.minWidth = maxWidth ? `min(${triggerWidth}px, ${maxWidth})` : `${triggerWidth}px`
  }

  function syncStableHeight(availableHeight?: number) {
    const wrapper = wrapperRef.value
    const container = containerRef.value

    if (!wrapper || !container || !toValue(options.stableHeight) || toValue(options.sheet)) {
      return
    }

    // `min-height` would be inherited by the container through `min-h-inherit` and then push the
    // wrapper past it by its own padding, growing a few pixels every frame. A fixed height has no
    // such feedback, and `scrollHeight` still reports the content once it outgrows the box.
    if (stablePadding === null) {
      const style = getComputedStyle(wrapper)
      stablePadding = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
    }

    // Held at the height a previous pass picked, the container reports that height instead of the
    // content, so the lock could never follow the content back up: a panel cut short by the space
    // it opened into would keep its scrollbar after the space grew. Read unheld — nothing paints
    // before the height goes back on — and let `max-height` keep the panel inside the viewport.
    wrapper.style.height = ''

    const contentHeight = container.scrollHeight + stablePadding

    // The first pass runs while the panel is still parked and pre-reveal, where a layout that has
    // not settled yet can read short. Only a revealed panel records a height it then keeps.
    if (isRevealed.value && contentHeight > lockedHeight.value) {
      lockedHeight.value = contentHeight
    }

    const capped =
      availableHeight == null ? lockedHeight.value : Math.min(lockedHeight.value, availableHeight)
    const value = capped > 0 ? `${capped}px` : ''

    if (wrapper.style.height !== value) {
      wrapper.style.height = value
    }

    if (capped <= 0) {
      markSizeLimit(wrapper, 'content')
    } else {
      // `space` says the room around the panel, not the lock, decided the height it got.
      markSizeLimit(wrapper, capped < lockedHeight.value ? 'space' : 'stable')
    }
  }

  function resetStableHeight() {
    lockedHeight.value = 0
    stablePadding = null

    if (wrapperRef.value) {
      wrapperRef.value.style.height = ''
    }
  }

  function roundByDPR(value: number) {
    const dpr = window.devicePixelRatio || 1

    return Math.round(value * dpr) / dpr
  }

  // The cap stays a variable so the wrapper folds it together with the design limit in one
  // `max-height`. Scroll frames re-run this pass with the same space, and rewriting the same value
  // would only dirty the style and lay the panel out again.
  function syncAvailableHeight(wrapper: HTMLElement, availableHeight: number) {
    const value = `${Math.max(0, Math.round(availableHeight))}px`

    if (wrapper.style.getPropertyValue('--popover-available-height') !== value) {
      wrapper.style.setProperty('--popover-available-height', value)
    }
  }

  function getPositionMiddleware() {
    return [
      toValue(options.autoPosition) && flip(),
      shift({ padding: 4, crossAxis: true }),
      // Cap what is left after flip picked a side: content taller than the space scrolls inside the
      // panel instead of spilling past the viewport edge.
      toValue(options.autoPosition) &&
        !toValue(options.sheet) &&
        size({
          padding: 4,
          apply({ availableHeight, elements }) {
            syncAvailableHeight(elements.floating, availableHeight)
          },
        }),
      toValue(options.showArrow) && arrow({ element: arrowRef.value }),
      toValue(options.closeOnInvisible) && hide({ strategy: 'escaped' }),
      toValue(options.closeOnInvisible) && hide({ strategy: 'referenceHidden' }),
    ]
  }

  async function updatePosition() {
    // An as-child trigger that never resolved to an element has nothing to measure.
    if (!wrapperRef.value || !triggerRef.value) {
      return
    }

    const seq = ++positionSeq

    syncWidth()

    const result = await computePosition(getReferenceElement(), wrapperRef.value, {
      strategy: 'fixed',
      placement: toValue(options.position),
      middleware: getPositionMiddleware(),
    })

    // A scroll can queue several computes; a stale one must not overwrite a newer result.
    if (seq !== positionSeq) {
      return
    }

    const { x, y, placement, middlewareData } = result

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

    syncStableHeight(middlewareData.size?.availableHeight)

    const transform = toValue(options.sheet)
      ? ''
      : `translate(${roundByDPR(x)}px, ${roundByDPR(y)}px)`

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
    if (!toValue(options.autoPosition) || !wrapperRef.value || !triggerRef.value) {
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
    if (showPopoverTimer || toValue(options.disabled)) {
      return
    }

    clearHideTimer()

    // Fully shown and tracked: a modelValue echo must not restart the position sync.
    if (isRevealed.value && cleanupAutoUpdate) {
      return
    }

    const shown = await new Promise<boolean>((resolve) => {
      showPopoverResolve = resolve
      showPopoverTimer = setTimeout(() => {
        showPopoverTimer = null
        showPopoverResolve = null
        resolve(true)
      }, toValue(options.showDelay))
    })

    if (!shown) {
      return
    }

    // Position before the enter transition starts, while data-visible is still false.
    if (!isVisible.value) {
      positionReady.value = false
      wrapperTransform.value = HIDDEN_TRANSFORM
      resetStableHeight()
    }

    const visiblePromise = showPopover()
    await syncPosition()
    positionReady.value = true
    await visiblePromise
  }

  function handlePopoverEscape(ev: KeyboardEvent) {
    options.onEscape?.(ev)

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

    const hidden = await new Promise<boolean>((resolve) => {
      hidePopoverResolve = resolve
      hidePopoverTimer = setTimeout(
        () => {
          hidePopoverTimer = null
          hidePopoverResolve = null
          resolve(true)
        },
        immediate ? 0 : toValue(options.hideDelay),
      )
    })

    if (!hidden) {
      return
    }

    triggerElements = null
    disposeAutoUpdate()

    void hidePopover()
  }

  function activateTrigger(trigger: HTMLElement, toggleSameTrigger: boolean = true) {
    const isSameTrigger = trigger === activeTriggerRef.value || !toValue(options.triggerSelector)

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
    if (toValue(options.disabled) || closeIfForeign(ev.target)) {
      return
    }

    const trigger = resolveTriggerElement(ev.target)

    if (!trigger) {
      if (!isManual.value && toValue(options.closeOnOutsideClick) && isVisible.value) {
        void handlePopoverHide()
      }

      return
    }

    options.onTriggerClick?.(ev as PointerEvent)

    if (triggerMethods.value.includes('click')) {
      if (triggerMethods.value.includes('hover') && isVisible.value) {
        return
      }

      if (toValue(options.alignPoint) && !isVisible.value) {
        updatePointerPosition(ev as PointerEvent)
      }

      activateTrigger(trigger, toValue(options.toggleOnTrigger))
    } else if (
      toValue(options.alignPoint) &&
      isVisible.value &&
      triggerMethods.value.includes('contextmenu') &&
      !triggerMethods.value.includes('hover')
    ) {
      void handlePopoverHide()
    }
  }

  function onTriggerPointerOver(ev: PointerEvent) {
    if (!isTriggerMethod('hover')) {
      return
    }

    const trigger = resolveTrigger(ev)

    if (trigger) {
      if (toValue(options.alignPoint)) {
        updatePointerPosition(ev)
      }

      activateTrigger(trigger, false)
    }
  }
  // pointerout bubbles, so it also covers what pointerleave used to handle.
  function onTriggerPointerOut(ev: PointerEvent) {
    if (!isTriggerMethod('hover')) {
      return
    }

    const next = ev.relatedTarget
    const isInside = next instanceof Node && (triggerRef.value?.contains(next) ?? false)

    if (!isInside) {
      // Focus may still rest on the trigger or the content even after the pointer left.
      if (
        triggerMethods.value.includes('focus') &&
        ((triggerRef.value?.contains(document.activeElement) ?? false) ||
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
      !toValue(options.triggerSelector) ||
      !resolveTriggerElement(ev.target) ||
      resolveTriggerElement(next)
    ) {
      return
    }

    hideOnNextFrame()
  }

  function onTriggerPointerMove(ev: PointerEvent) {
    if (!isTriggerMethod('hover') || !toValue(options.alignPoint)) {
      return
    }

    updatePointerPosition(ev)

    if (isVisible.value) {
      throttledUpdatePosition()
    }
  }

  function onTriggerContextmenu(ev: PointerEvent) {
    if (!isTriggerMethod('contextmenu')) {
      return
    }

    const trigger = resolveTrigger(ev)

    if (!trigger) {
      return
    }

    ev.preventDefault()

    if (toValue(options.alignPoint)) {
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
    if (!isTriggerMethod('focus')) {
      return
    }

    const trigger = resolveTrigger(ev)

    if (trigger) {
      activateTrigger(trigger, false)
    }
  }

  function onTriggerFocusOut(ev: FocusEvent) {
    if (!isTriggerMethod('focus')) {
      return
    }

    const next = ev.relatedTarget

    if (
      next instanceof Node &&
      ((triggerRef.value?.contains(next) ?? false) || (wrapperRef.value?.contains(next) ?? false))
    ) {
      return
    }

    void handlePopoverHide()
  }

  function onWrapperKeydown(ev: KeyboardEvent) {
    if (toValue(options.disabled) || !isVisible.value) {
      return
    }

    options.onWrapperKeydown?.(ev)
  }

  function onWrapperPointerEnter() {
    if (toValue(options.disabled) || !toValue(options.interactive) || !isVisible.value) {
      return
    }

    void handlePopoverShow()
  }

  function onWrapperPointerLeave() {
    if (toValue(options.disabled) || !triggerMethods.value.includes('hover')) {
      return
    }

    void handlePopoverHide()
  }

  // Elements the popup announces itself on, and whether the `aria-haspopup` there is its own, so
  // a target that moves — a field's input mounting after the anchor — leaves nothing behind.
  const ariaElements = new Map<HTMLElement, boolean>()

  function syncTriggerAria() {
    const ariaTarget = toValue(options.ariaTarget)
    // A field's control is often not the element its popover anchors to: when a target is given,
    // the popup state is announced there only, never on the anchor.
    const triggers = ariaTarget
      ? [ariaTarget]
      : toValue(options.triggerSelector)
        ? getTriggerElements()
        : [triggerRef.value]
    const isTooltip = toValue(options.contentRole) === 'tooltip'

    for (const [element, ownsHaspopup] of ariaElements) {
      if (triggers.includes(element)) {
        continue
      }

      element.removeAttribute('aria-expanded')
      element.removeAttribute('aria-describedby')

      if (ownsHaspopup) {
        element.removeAttribute('aria-haspopup')
      }

      ariaElements.delete(element)
    }

    for (const trigger of triggers) {
      if (!trigger) {
        continue
      }

      if (isTooltip) {
        ariaElements.set(trigger, ariaElements.get(trigger) === true)

        if (isVisible.value) {
          trigger.setAttribute('aria-describedby', contentId)
        } else {
          trigger.removeAttribute('aria-describedby')
        }

        continue
      }

      // A control that already declares its own popup role, like a select's listbox, knows better
      // than this default: only an unclaimed trigger is announced as a dialog.
      if (trigger.hasAttribute('aria-haspopup')) {
        ariaElements.set(trigger, ariaElements.get(trigger) === true)
      } else {
        trigger.setAttribute('aria-haspopup', 'dialog')
        ariaElements.set(trigger, true)
      }

      trigger.setAttribute(
        'aria-expanded',
        String(isVisible.value && (Boolean(ariaTarget) || trigger === activeTriggerRef.value)),
      )
    }
  }

  watch(
    () => toValue(options.modelValue),
    (visible) => {
      if (visible) {
        void handlePopoverShow()
      } else {
        void handlePopoverHide(true)
      }
    },
  )

  watch(
    triggerRef,
    (element, previous) => {
      if (!element || element === previous || !isVisible.value) {
        return
      }

      // `as-child` may swap the element it clones; the panel follows the live node.
      void syncPosition()
    },
    { flush: 'post' },
  )

  watch(
    [isVisible, activeTriggerRef, triggerRef, () => toValue(options.ariaTarget)],
    syncTriggerAria,
    {
      flush: 'post',
    },
  )

  onMounted(() => {
    if (toValue(options.modelValue)) {
      void handlePopoverShow()
    }
  })

  onBeforeUnmount(() => {
    clearShowTimer()
    clearHideTimer()
    disposeAutoUpdate()
    triggerElements = null

    // The announce target may outlive this popover (an external element), and a control that
    // stays `aria-expanded=true` after its popup is gone lies to assistive tech.
    for (const [element, ownsHaspopup] of ariaElements) {
      element.removeAttribute('aria-expanded')
      element.removeAttribute('aria-describedby')

      if (ownsHaspopup) {
        element.removeAttribute('aria-haspopup')
      }
    }

    ariaElements.clear()
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
