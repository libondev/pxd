<script lang="ts" setup>
import type { PopoverEmits, PopoverProps, PopoverTrigger } from './types'
import type { CSSProperties } from 'vue'
import { arrow, autoUpdate, computePosition, flip, shift, hide } from '@floating-ui/dom'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useDelayDestroy } from '../../composables/use-delay-destroy'
import { useLockScroll } from '../../composables/use-lock-scroll'
import { useOutsideClick } from '../../composables/use-outside-click'
import { useOverlayManager } from '../../composables/use-overlay-manager'
import { useConfigProvider } from '../../contexts/config-provider'
import { cachedOff, cachedOn, sleep } from '../../utils/event'
import { getCssUnitValue, toArray } from '../../utils/format'
import PTeleport from '../teleport/index.vue'

defineOptions({
  name: 'PPopover',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<PopoverProps>(), {
  offset: 8,
  trigger: () => ['hover'],
  position: 'bottom',
  showDelay: 0,
  hideDelay: 0,
  arrowColor: 'hsl(var(--primary))',
  interactive: true,
  autoPosition: true,
  toggleOnTrigger: true,
  closeOnInvisible: true,
})

const emits = defineEmits<PopoverEmits>()

let isLockedScroll = false
let showPopoverTimer: ReturnType<typeof setTimeout> | null
let hidePopoverTimer: ReturnType<typeof setTimeout> | null
let cleanupAutoUpdate: (() => void) | null = null

const allowedMethods = ['click', 'manual', 'contextmenu'] as const

const arrayRef = shallowRef<HTMLElement>(null!)
const triggerRef = shallowRef<HTMLElement>(null!)
const wrapperRef = shallowRef<HTMLElement>(null!)
const localPosition = shallowRef(props.position)

const triggerMethods = computed<PopoverTrigger[]>(() => toArray(props.trigger))
const transitionType = computed(() =>
  props.transitionType || props.adaptive ? 'fade-slide' : 'fade-scale',
)

const wrapperStyle = computed<CSSProperties>(() => ({
  'z-index': props.zIndex,
  '--popover-offset': props.offset,
  '--popover-arrow-bg': props.arrowColor,
  '--popover-max-width': getCssUnitValue(props.maxWidth),
}))

const configProvider = useConfigProvider()
const { lockScroll, unlockScroll } = useLockScroll()

const allowOutsideClick = computed(() =>
  allowedMethods.some((method) => triggerMethods.value.includes(method)),
)

const {
  render: isRender,
  visible: isVisible,
  show: showPopover,
  hide: hidePopover,
} = useDelayDestroy(props.visible, {
  delay: 2000,
  visibleChange(v) {
    if (triggerMethods.value.includes('manual')) {
      return
    }

    emits('visible-change', v)

    if (v) {
      if (props.lockScrollOnVisible) {
        isLockedScroll = true
        lockScroll()
      }

      emits('show')
    } else {
      if (isLockedScroll) {
        isLockedScroll = false
        unlockScroll()
      }

      emits('hide')
    }
  },
})

const { dispatchClickOutside } = useOverlayManager(
  computed(() => ({
    enabled: isVisible.value,
    closeOnPressEscape: props.closeOnPressEscape,
    closeOnClickOutside: allowOutsideClick.value && !triggerMethods.value.includes('manual'),
    onPressEscape: (ev: KeyboardEvent) => {
      emits('escape', ev)
    },
    onClickOutside: (ev: PointerEvent) => {
      emits('outside-click', ev)
    },
    onClose: () => {
      handlePopoverHide(props.adaptive)
    },
  })),
)

useOutsideClick(wrapperRef, {
  isEnabled: () => {
    return isVisible.value && allowOutsideClick.value
  },
  isOutside: (ev) => {
    const el = ev.target as HTMLElement
    return !(triggerRef.value?.contains(el) || wrapperRef.value?.contains(el))
  },
  onTrigger: (ev) => {
    dispatchClickOutside(ev)
  },
})

function disposeAutoUpdate() {
  if (cleanupAutoUpdate) {
    cleanupAutoUpdate()
    cleanupAutoUpdate = null
  }
}

async function updatePosition() {
  const { x, y, placement, middlewareData } = await computePosition(
    triggerRef.value,
    wrapperRef.value,
    {
      placement: props.position,
      middleware: [
        shift(),
        props.autoPosition && flip(),
        props.showArrow && arrow({ element: arrayRef.value }),
        props.closeOnInvisible && hide({ strategy: 'referenceHidden' }),
        props.closeOnInvisible && hide({ strategy: 'escaped' }),
      ],
    },
  )

  localPosition.value = placement

  if (middlewareData.hide?.referenceHidden || middlewareData.hide?.escaped) {
    handlePopoverHide(true)
    return
  }

  Object.assign(wrapperRef.value.style, {
    left: `${x}px`,
    top: `${y}px`,
  })

  if (middlewareData.arrow) {
    const { x: arrowX, y: arrowY } = middlewareData.arrow
    Object.assign(arrayRef.value.style, {
      left: arrowX != null ? `${Math.max(arrowX, 5)}px` : '',
      top: arrowY != null ? `${Math.max(arrowY, 5)}px` : '',
    })
  }
}

async function handlePopoverShow() {
  if (showPopoverTimer || props.disabled) {
    return
  }

  await new Promise<void>((resolve) => {
    if (hidePopoverTimer) {
      clearTimeout(hidePopoverTimer)
      hidePopoverTimer = null
    }

    showPopoverTimer = setTimeout(() => {
      showPopoverTimer = null
      resolve()
    }, props.showDelay)
  })

  await showPopover()

  if (props.closeOnPressEscape) {
    cachedOn(document, 'keydown', onPopoverKeydown)
  }

  // Some components often need to cover the screen on mobile devices,
  // so there is no need to adjust their positions.
  if (props.adaptive) {
    Object.assign(wrapperRef.value.style, { left: '0', top: '0' })
    return
  }

  disposeAutoUpdate()

  if (props.autoPosition) {
    cleanupAutoUpdate = autoUpdate(triggerRef.value, wrapperRef.value, updatePosition)
  } else {
    await updatePosition()
  }
}

async function handlePopoverHide(immediate: boolean = false) {
  if (hidePopoverTimer) {
    return
  }

  await new Promise<void>((resolve) => {
    if (showPopoverTimer) {
      clearTimeout(showPopoverTimer)
      showPopoverTimer = null
    }

    hidePopoverTimer = setTimeout(
      () => {
        hidePopoverTimer = null
        resolve()
      },
      immediate ? 0 : props.hideDelay,
    )
  })

  disposeAutoUpdate()

  hidePopover()

  if (props.closeOnPressEscape) {
    cachedOff(document, 'keydown', onPopoverKeydown)
  }
}

function onPopoverKeydown(ev: KeyboardEvent) {
  const { key } = ev

  if (key === 'Tab') {
    ev.preventDefault()
    ev.stopPropagation()
  }
}

async function onTriggerClick(ev: Event) {
  if (props.disabled) {
    return
  }

  emits('trigger-click', ev as PointerEvent)

  if (!triggerMethods.value.includes('click')) {
    return
  }

  if (isVisible.value && props.toggleOnTrigger) {
    handlePopoverHide()

    return
  }

  handlePopoverShow()
}

function onTriggerPointerEnter() {
  if (props.disabled || !triggerMethods.value.includes('hover')) {
    return
  }

  handlePopoverShow()
}

function onTriggerPointerLeave() {
  if (props.disabled || !triggerMethods.value.includes('hover')) {
    return
  }

  handlePopoverHide()
}

function onTriggerFocusin() {
  if (props.disabled || !triggerMethods.value.includes('focus')) {
    return
  }

  handlePopoverShow()
}

async function onTriggerFocusout() {
  if (props.disabled || !triggerMethods.value.includes('focus')) {
    return
  }

  // Make sure the wrapperRef element has gained focus after clicking on it
  await sleep(0)

  if (wrapperRef.value.contains(document.activeElement)) {
    return
  }

  handlePopoverHide()
}

async function onTriggerContextmenu() {
  if (props.disabled || !triggerMethods.value.includes('contextmenu')) {
    return
  }

  if (isVisible.value) {
    await handlePopoverHide()

    return
  }

  await handlePopoverShow()
}

function onContentPointerEnter() {
  if (props.disabled) {
    return
  }

  if (!props.interactive || !isVisible.value) {
    return
  }

  handlePopoverShow()
}

function onContentPointerLeave() {
  if (props.disabled) {
    return
  }

  if (props.interactive && !triggerMethods.value.includes('hover')) {
    return
  }

  handlePopoverHide()
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      handlePopoverShow()
    } else {
      handlePopoverHide()
    }
  },
)

onBeforeUnmount(() => {
  if (isLockedScroll) {
    isLockedScroll = false
    unlockScroll()
  }

  disposeAutoUpdate()
  cachedOff(document, 'keydown', onPopoverKeydown)
})

defineExpose({
  show: handlePopoverShow,
  hide: handlePopoverHide,
})
</script>

<template>
  <div
    ref="triggerRef"
    class="pxd-popover inline-flex max-w-full active:select-none data-[disabled=true]:pointer-events-none data-[visible=true]:pointer-events-auto"
    :data-visible="isVisible"
    :data-disabled="disabled"
    v-bind="$attrs"
    @click="onTriggerClick"
    @focusin="onTriggerFocusin"
    @focusout="onTriggerFocusout"
    @pointerenter="onTriggerPointerEnter"
    @pointerleave="onTriggerPointerLeave"
    @contextmenu.prevent="onTriggerContextmenu"
  >
    <slot />

    <PTeleport>
      <div
        v-if="isRender"
        ref="wrapperRef"
        tabindex="-1"
        :class="wrapperClass"
        :style="wrapperStyle"
        :data-visible="isVisible"
        :data-adaptive="adaptive"
        :data-position="localPosition"
        :data-interactive="interactive"
        class="pxd-popover--wrapper sm:max-w-(--popover-max-width) absolute -top-full -left-full isolate z-10 flex max-h-full max-w-full outline-none data-[interactive=false]:pointer-events-none data-[visible=false]:pointer-events-none motion-reduce:data-[visible=false]:hidden"
        @pointerenter="onContentPointerEnter"
        @pointerleave="onContentPointerLeave"
      >
        <div
          class="pxd-popover--container relative z-1 max-dvh-80 w-inherit default-transition-duration default-transition-timing-function"
          :data-transition-type="transitionType"
          :data-show-transition="configProvider.popoverShowTransition"
        >
          <i
            v-if="showArrow"
            ref="arrayRef"
            class="pxd-popover--arrow w-2.5 h-2.5 rounded-xs absolute z-1 rotate-45 bg-(--popover-arrow-bg)"
          />
          <div
            class="pxd-popover--content h-full max-h-inherit overflow-auto"
            :class="contentClass"
            :style="contentStyle"
          >
            <slot name="content" />
          </div>
        </div>
      </div>
    </PTeleport>
  </div>
</template>

<style lang="postcss">
.pxd-popover--container {
  --popover-padding: calc(var(--popover-offset, 8) * 1px);
  transition-property: opacity, transform;
  opacity: 0;
  pointer-events: none;

  [data-visible='true'] & {
    opacity: 1;
    pointer-events: auto;
  }

  [data-visible='true'] &[data-show-transition='false'] {
    transition-duration: 0s !important;
  }

  [data-visible='false'] &[data-transition-type='fade-scale'] {
    transform: scale(0.97);
  }

  [data-visible='false'] &[data-transition-type='fade-slide'] {
    transform: translateY(100%);
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

  [data-position^='top'][data-adaptive='false'] & {
    padding-bottom: var(--popover-padding);
  }

  [data-position^='bottom'][data-adaptive='false'] & {
    padding-top: var(--popover-padding);
  }

  [data-position^='left'][data-adaptive='false'] & {
    padding-right: var(--popover-padding);
  }

  [data-position^='right'][data-adaptive='false'] & {
    padding-left: var(--popover-padding);
  }
}

.pxd-popover--wrapper[data-position^='top'] .pxd-popover--arrow {
  bottom: 4px;
}

.pxd-popover--wrapper[data-position^='bottom'] .pxd-popover--arrow {
  top: 4px;
}

.pxd-popover--wrapper[data-position^='left'] .pxd-popover--arrow {
  right: 4px;
}

.pxd-popover--wrapper[data-position^='right'] .pxd-popover--arrow {
  left: 4px;
}
</style>
