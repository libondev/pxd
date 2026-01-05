<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { PopoverTrigger } from '../../types/components/popover'
import type { ComponentClass, ComponentPosition, Nullable } from '../../types/shared'
import { arrow, computePosition, flip, offset, shift } from '@floating-ui/dom'
import { computed, shallowRef, watch } from 'vue'
import { useIntersectionObserver } from '../../composables/use-browser-observer'
import { useDelayDestroy } from '../../composables/use-delay-destroy'
import { useOutsideClick } from '../../composables/use-outside-click'
import { debounce } from '../../utils/debounce'
import { cachedOff, cachedOn } from '../../utils/event'
import { getCssUnitValue, toArray } from '../../utils/format'
import PTeleport from '../teleport/index.vue'

interface Props {
  zIndex?: number | string
  offset?: number
  visible?: boolean
  trigger?: PopoverTrigger | PopoverTrigger[]
  disabled?: boolean
  maxWidth?: number | string
  position?: ComponentPosition
  showDelay?: number
  hideDelay?: number
  enterable?: boolean
  showArrow?: boolean
  arrowColor?: string
  autoPosition?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
  transitionType?: 'fade' | 'fade-scale'
  closeOnInvisible?: boolean
  closeOnPressEscape?: boolean
}

defineOptions({
  name: 'PPopover',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  {
    offset: 8,
    trigger: () => ['hover'],
    position: 'bottom',
    showDelay: 300,
    hideDelay: 300,
    arrowColor: 'hsl(var(--primary))',
    autoPosition: true,
    transitionType: 'fade-scale',
    closeOnInvisible: true,
  },
)

const emits = defineEmits<{
  'show': []
  'hide': []
  'escape': [KeyboardEvent]
  'outside-click': [MouseEvent]
  'trigger-click': [PointerEvent]
  'visible-change': [visible: boolean]
}>()

let showPopoverTimer: ReturnType<typeof setTimeout> | null
let hidePopoverTimer: ReturnType<typeof setTimeout> | null

const allowedMethods = ['click', 'manual', 'contextmenu'] as const

const arrayRef = shallowRef<HTMLElement>(null!)
const triggerRef = shallowRef<HTMLElement>(null!)
const wrapperRef = shallowRef<HTMLElement>(null!)
const localPosition = shallowRef(props.position)

const triggerMethods = computed<PopoverTrigger[]>(() => toArray(props.trigger))

const wrapperStyle = computed<CSSProperties>(() => ({
  'z-index': props.zIndex,
  '--popover-bg': props.arrowColor,
  '--popover-max-width': getCssUnitValue(props.maxWidth),
}))

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
      emits('show')
    } else {
      emits('hide')
    }
  },
})

useOutsideClick(wrapperRef, {
  isEnabled: () => {
    return isVisible.value && allowedMethods.some(t => triggerMethods.value.includes(t))
  },
  isOutside: (ev) => {
    const el = ev.target as HTMLElement
    return !(triggerRef.value?.contains(el) || wrapperRef.value?.contains(el))
  },
  onTrigger: debounce((ev) => {
    emits('outside-click', ev)

    if (triggerMethods.value.includes('manual')) {
      return
    }

    handlePopoverHide()
  }, 500, { edges: ['leading'] }),
})

useIntersectionObserver(triggerRef, ([entry]) => {
  if (props.closeOnInvisible && isVisible.value && entry!.intersectionRatio === 0) {
    handlePopoverHide(true)
  }
})

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

  const { x, y, placement, middlewareData } = await computePosition(
    triggerRef.value,
    wrapperRef.value,
    {
      placement: localPosition.value,
      middleware: [
        shift(),
        offset(props.offset),
        props.autoPosition && flip(),
        props.showArrow && arrow({ element: arrayRef.value }),
      ],
    },
  )
  localPosition.value = placement

  Object.assign(wrapperRef.value.style, {
    left: `${x}px`,
    top: `${y}px`,
  })

  if (middlewareData.arrow) {
    const { x, y } = middlewareData.arrow
    Object.assign(arrayRef.value.style, {
      left: x != null ? `${Math.max(x, 5)}px` : '',
      top: y != null ? `${Math.max(y, 5)}px` : '',
    })
  }

  if (props.closeOnPressEscape) {
    cachedOn(document, 'keydown', onPopoverKeystroke)
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

    hidePopoverTimer = setTimeout(() => {
      hidePopoverTimer = null
      resolve()
    }, immediate ? 0 : props.hideDelay)
  })

  await hidePopover()

  if (props.closeOnPressEscape) {
    cachedOff(document, 'keydown', onPopoverKeystroke)
  }
}

function onPopoverKeystroke(ev: KeyboardEvent) {
  if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
    return
  }

  if (ev.key !== 'Escape') {
    return
  }

  emits('escape', ev)
  handlePopoverHide(true)
}

async function onTriggerClick(ev: Event) {
  if (props.disabled) {
    return
  }

  emits('trigger-click', ev as PointerEvent)

  if (!triggerMethods.value.includes('click')) {
    return
  }

  if (isVisible.value) {
    handlePopoverHide()

    return
  }

  handlePopoverShow()
}

function onTriggerPointerEnter() {
  if (props.disabled) {
    return
  }

  handlePopoverShow()
}

function onTriggerPointerLeave() {
  if (props.disabled) {
    return
  }

  handlePopoverHide()
}

function onTriggerFocusin() {
  if (props.disabled) {
    return
  }

  handlePopoverShow()
}

function onTriggerFocusout() {
  if (props.disabled) {
    return
  }

  handlePopoverHide()
}

async function onTriggerContextmenu() {
  if (props.disabled) {
    return
  }

  if (!triggerMethods.value.includes('contextmenu')) {
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

  if (!props.enterable || !isVisible.value) {
    return
  }

  handlePopoverShow()
}

function onContentPointerLeave() {
  if (props.disabled) {
    return
  }

  if (props.enterable && !triggerMethods.value.includes('hover')) {
    return
  }

  handlePopoverHide()
}

const triggerMethodEvents = {
  focus: [
    ['focusin', onTriggerFocusin],
    ['focusout', onTriggerFocusout],
  ],
  hover: [
    ['pointerenter', onTriggerPointerEnter],
    ['pointerleave', onTriggerPointerLeave],
  ],
} as const

function updateTriggerEvents(
  methods: PopoverTrigger[],
  dom: Nullable<EventTarget>,
  handler: typeof cachedOn | typeof cachedOff,
) {
  for (const method of methods) {
    const events = triggerMethodEvents[method as keyof typeof triggerMethodEvents]

    if (!events) {
      continue
    }

    for (const event of events) {
      handler(dom, event[0], event[1])
    }
  }
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

watch<[Nullable<HTMLElement>, PopoverTrigger[]]>(
  () => [triggerRef.value, triggerMethods.value],
  ([newDom, newMethods], [oldDom, oldMethods]) => {
    updateTriggerEvents(oldMethods, oldDom, cachedOff)

    updateTriggerEvents(newMethods, newDom, cachedOn)
  },
)

defineExpose({
  show: handlePopoverShow,
  hide: handlePopoverHide,
})
</script>

<template>
  <div
    ref="triggerRef"
    class="pxd-popover inline-flex max-w-full active:select-none"
    v-bind="$attrs"
    @contextmenu.prevent="onTriggerContextmenu"
    @click="onTriggerClick"
  >
    <slot />

    <PTeleport>
      <div
        v-if="isRender"
        ref="wrapperRef"
        :class="wrapperClass"
        :style="wrapperStyle"
        :data-visible="isVisible"
        :data-enterable="enterable"
        :data-position="localPosition"
        :data-transition-type="transitionType"
        class="pxd-popover--container sm:max-w-(--popover-max-width) absolute isolate z-1 w-max max-w-full motion-reduce:data-[visible=false]:hidden"
        @pointerenter="onContentPointerEnter"
        @pointerleave="onContentPointerLeave"
      >
        <i v-if="showArrow" ref="arrayRef" class="pxd-popover--arrow absolute z-1 border-solid" />
        <div class="pxd-popover--content" :class="contentClass" :style="contentStyle">
          <slot name="content" />
        </div>
      </div>
    </PTeleport>
  </div>
</template>

<style lang="postcss">
@keyframes popover-fade-show {
  0% { opacity: 0; pointer-events: none; }
  100% { opacity: 1 }
}
@keyframes popover-fade-hide {
  0% { opacity: 1 }
  100% { opacity: 0; pointer-events: none; }
}
@keyframes popover-fade-scale-show {
  0% { transform: scale(0.95); opacity: 0; pointer-events: none; }
  100% { transform: scale(1); opacity: 1 }
}
@keyframes popover-fade-scale-hide {
  0% { transform: scale(1); opacity: 1 }
  100% { transform: scale(0.95); opacity: 0; pointer-events: none; }
}

.pxd-popover--container {
  will-change: transform, opacity;
  animation: popover-fade-show var(--default-transition-duration) var(--default-transition-timing-function) forwards;

  &[data-visible="true"][data-transition-type="fade"] {
    animation-name: popover-fade-show;
  }

  &[data-visible="false"][data-transition-type="fade"] {
    animation-name: popover-fade-hide;
  }

  &[data-visible="true"][data-transition-type="fade-scale"] {
    animation-name: popover-fade-scale-show;
  }

  &[data-visible="false"][data-transition-type="fade-scale"] {
    animation-name: popover-fade-scale-hide;
  }

  &[data-enterable="false"] {
    pointer-events: none;
  }

  &[data-position='top'] {
    transform-origin: bottom center;
  }
  &[data-position='top-start'] {
    transform-origin: bottom left;
  }
  &[data-position='top-end'] {
    transform-origin: bottom right;
  }

  &[data-position='bottom'] {
    transform-origin: top center;
  }
  &[data-position='bottom-start'] {
    transform-origin: top left;
  }
  &[data-position='bottom-end'] {
    transform-origin: top right;
  }

  &[data-position='left'] {
    transform-origin: right center ;
  }
  &[data-position='left-start'] {
    transform-origin: right top;
  }
  &[data-position='left-end'] {
    transform-origin: right bottom;
  }

  &[data-position='right'] {
    transform-origin: left center;
  }
  &[data-position='right-start'] {
    transform-origin: left top;
  }
  &[data-position='right-end'] {
    transform-origin: left bottom;
  }

  &[data-position="top"] .pxd-popover--arrow,
  &[data-position="top-start"] .pxd-popover--arrow,
  &[data-position="top-end"] .pxd-popover--arrow {
    bottom: -5px;
    border-width: 6px 6px 0;
    border-color: var(--popover-bg) transparent transparent;
  }

  &[data-position='bottom'] .pxd-popover--arrow,
  &[data-position='bottom-start'] .pxd-popover--arrow,
  &[data-position='bottom-end'] .pxd-popover--arrow {
    top: -5px;
    border-width: 0 6px 6px;
    border-color: transparent transparent var(--popover-bg);
  }

  &[data-position='left'] .pxd-popover--arrow,
  &[data-position='left-start'] .pxd-popover--arrow,
  &[data-position='left-end'] .pxd-popover--arrow {
    right: -5px;
    border-width: 6px 0 6px 6px;
    border-color: transparent transparent transparent var(--popover-bg);
  }

  &[data-position='right'] .pxd-popover--arrow,
  &[data-position='right-start'] .pxd-popover--arrow,
  &[data-position='right-end'] .pxd-popover--arrow {
    left: -5px;
    border-width: 6px 6px 6px 0;
    border-color: transparent var(--popover-bg) transparent transparent;
  }
}
</style>
