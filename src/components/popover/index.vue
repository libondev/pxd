<script lang="ts" setup>
import type { PopoverEmits, PopoverProps, PopoverTrigger } from './types'
import type { CSSProperties } from 'vue'
import { arrow, autoUpdate, computePosition, flip, shift, hide } from '@floating-ui/dom'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useDelayDestroy } from '../../composables/use-delay-destroy'
import { useFocusTrap } from '../../composables/use-focus-trap'
import { useOutsideClick } from '../../composables/use-outside-click'
import { useConfigProvider } from '../../contexts/config-provider'
import { getCssUnitValue, toArray } from '../../utils/format'
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
let cleanupAutoUpdate: (() => void) | null = null

const arrayRef = shallowRef<HTMLElement>(null!)
const triggerRef = shallowRef<HTMLElement>(null!)
const wrapperRef = shallowRef<HTMLElement>(null!)
const localPosition = shallowRef(props.position)

const triggerMethods = computed<PopoverTrigger[]>(() => toArray(props.trigger))
const transitionType = computed(() => (props.adaptive ? 'fade-slide' : 'fade-scale'))

const wrapperStyle = computed<CSSProperties>(() => ({
  '--popover-index': props.zIndex,
  '--popover-offset': props.offset,
  '--popover-arrow-color': props.arrowColor,
  '--popover-max-width': getCssUnitValue(props.maxWidth),
}))

const configProvider = useConfigProvider()

const allowOutsideClick = computed(() => !triggerMethods.value.includes('manual'))
const focusTrapContainer = computed(() => {
  if (isVisible.value && !triggerMethods.value.includes('focus')) {
    return wrapperRef.value
  }

  return null
})

const {
  render: isRender,
  visible: isVisible,
  show: showPopover,
  hide: hidePopover,
} = useDelayDestroy(props.modelValue, {
  delay: 2000,
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
      handlePopoverHide(true)
    }
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

  const wrapperPositionStyle = {
    left: props.adaptive ? '0' : `${x}px`,
    top: props.adaptive ? '0' : `${y}px`,
  } as const

  Object.assign(wrapperRef.value.style, wrapperPositionStyle)

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
}

function onTriggerClick(ev: Event) {
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

function onTriggerFocusout(event: FocusEvent) {
  if (props.disabled || !triggerMethods.value.includes('focus')) {
    return
  }

  // Make sure that the focus is not turned off when switching from triggerRef to wrapperRef.
  const relatedTarget = event.relatedTarget as HTMLElement
  if (relatedTarget && wrapperRef.value?.contains(relatedTarget)) {
    return
  }

  handlePopoverHide()
}

function onTriggerContextmenu() {
  if (props.disabled || !triggerMethods.value.includes('contextmenu')) {
    return
  }

  if (isVisible.value) {
    handlePopoverHide()

    return
  }

  handlePopoverShow()
}

const PREVENT_KEYS = ['ArrowUp', 'ArrowDown', 'Home', 'End']

// Prevents the page from scrolling by pressing the key when popover appears.
function onWrapperKeydown(ev: KeyboardEvent) {
  if (props.disabled || !isVisible.value) {
    return
  }

  const { key } = ev

  if (PREVENT_KEYS.includes(key)) {
    ev.preventDefault()
  }
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

  if (props.interactive && !triggerMethods.value.includes('hover')) {
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

onBeforeUnmount(() => {
  disposeAutoUpdate()
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
        :class="wrapperClass"
        :style="wrapperStyle"
        class="pxd-popover--wrapper sm:max-w-(--popover-max-width) absolute -top-full -left-full isolate z-(--popover-index) flex max-h-full max-w-full outline-none data-[interactive=false]:pointer-events-none data-[visible=false]:pointer-events-none motion-reduce:data-[visible=false]:hidden"
        @keydown="onWrapperKeydown"
        @pointerenter="onWrapperPointerEnter"
        @pointerleave="onWrapperPointerLeave"
      >
        <div
          class="pxd-popover--container relative z-1 w-inherit default-transition-duration default-transition-timing-function"
          :data-transition-type="transitionType"
          :data-show-transition="configProvider.popoverShowTransition"
        >
          <i
            v-if="showArrow"
            ref="arrayRef"
            class="pxd-popover--arrow w-2.5 h-2.5 rounded-xs absolute z-1 rotate-45 bg-(--popover-arrow-color)"
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
    </POverlay>
  </div>
</template>

<style lang="postcss">
.pxd-popover--container {
  --popover-padding: calc(var(--popover-offset, 8) * 1px);
  transition-property: opacity, transform;
  max-height: min(800px, 80vh);
  max-height: min(800px, 80dvh);
  pointer-events: none;

  [data-visible='true'] & {
    opacity: 1;
    pointer-events: auto;
  }

  [data-visible='true'] &[data-show-transition='false'] {
    transition-duration: 0s !important;
  }

  [data-visible='false'] &[data-transition-type='fade-scale'] {
    opacity: 0;
    transform: scale(0.95);
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
  bottom: 0.3rem;
}

.pxd-popover--wrapper[data-position^='bottom'] .pxd-popover--arrow {
  top: 0.3rem;
}

.pxd-popover--wrapper[data-position^='left'] .pxd-popover--arrow {
  right: 0.3rem;
}

.pxd-popover--wrapper[data-position^='right'] .pxd-popover--arrow {
  left: 0.3rem;
}
</style>
