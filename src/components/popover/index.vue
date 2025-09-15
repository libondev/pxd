<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { PopoverTrigger } from '../../types/components/popover'
import type { ComponentClass, ComponentPosition, Nullable } from '../../types/shared'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useIntersectionObserver } from '../../composables/use-browser-observer'
import { useDelayDestroy } from '../../composables/use-delay-destroy'
import { useOutsideClick } from '../../composables/use-outside-click'
import { debounce } from '../../utils/debounce'
import {
  getElementRectFromContainer,
  getScrollContainer,
  getScrollElByContainer,
} from '../../utils/dom'
import { optimizedOff, optimizedOn } from '../../utils/event'
import { getCssUnitValue, toArray } from '../../utils/format'
import { isServer } from '../../utils/is'
import { throttleByRaf } from '../../utils/throttle'
import PTeleport from '../teleport/index.vue'

interface Props {
  zIndex?: number
  offset?: number
  visible?: boolean
  trigger?: PopoverTrigger | PopoverTrigger[]
  disabled?: boolean
  maxWidth?: number
  position?: ComponentPosition
  showDelay?: number
  hideDelay?: number
  enterable?: boolean
  showArrow?: boolean
  arrowColor?: string
  autoPosition?: boolean
  closeOnScroll?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
  showTransition?: boolean
  hideTransition?: boolean
  transitionType?: 'fade' | 'fade-scale'
  /** 最小可见比例(0~1), 仅当前可见区域比例小于该阈值时才会触发滚动过程中的自适应翻转 */
  minVisibleRatio?: number
  closeOnPressEscape?: boolean
  /** 自动调整位置的阈值, 当滚动距离超过该值时, 自动调整位置, 单位: px */
  autoPositionThreshold?: number
  /** 滚动隐藏的阈值, 当滚动距离超过该值时, 自动隐藏弹窗, 单位: px */
  closeOnScrollThreshold?: number
}

defineOptions({
  name: 'PPopover',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  {
    zIndex: 5,
    offset: 8,
    trigger: () => ['hover'],
    position: 'bottom',
    showDelay: 300,
    hideDelay: 300,
    arrowColor: 'hsl(var(--primary))',
    autoPosition: true,
    showTransition: true,
    hideTransition: true,
    transitionType: 'fade-scale',
    minVisibleRatio: 0.95,
    autoPositionThreshold: 30,
    closeOnScrollThreshold: 150,
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

let triggerRect: DOMRect | null = null
let wrapperRect: DOMRect | null = null
let viewportRect: DOMRect | null = null

let scrollContainer: ReturnType<typeof getScrollContainer>

let showPopoverTimer: ReturnType<typeof setTimeout> | null
let hidePopoverTimer: ReturnType<typeof setTimeout> | null

let savedScrollPosition = 0

const triggerRef = shallowRef<HTMLElement>()
const wrapperRef = shallowRef<HTMLElement>()
const wrapperStyle = shallowRef<CSSProperties>({
  '--popover-bg': props.arrowColor,
  '--popover-offset': getCssUnitValue(props.offset),
  '--popover-max-width': getCssUnitValue(props.maxWidth),
  '--popover-arrow-offset': `${props.offset - 5}px`,
})
const localPosition = shallowRef(props.position)
const triggerMethods = computed<PopoverTrigger[]>(() => toArray(props.trigger))

const {
  render: isRender,
  visible: isVisible,
  open: openPopover,
  close: closePopover,
} = useDelayDestroy(props.visible, {
  delay: 2000,
  visibleChange(v) {
    v ? emits('show') : emits('hide')
    emits('visible-change', v)
  },
})

const allowedMethods = ['click', 'manual', 'contextmenu'] as const

useOutsideClick(wrapperRef, {
  isEnabled: () => {
    return isVisible.value && allowedMethods.some(t => triggerMethods.value.includes(t))
  },
  isOutside: (ev) => {
    return !triggerRef.value?.contains(ev.target as HTMLElement)
  },
  onTrigger: debounce((ev) => {
    emits('outside-click', ev)

    if (triggerMethods.value.includes('manual')) {
      return
    }

    handlePopoverHide()
  }, 500, { edges: ['leading'] }),
})

let triggerVisible = false
useIntersectionObserver(triggerRef, ([entry]) => {
  triggerVisible = entry.isIntersecting
})

useIntersectionObserver(wrapperRef, ([entry]) => {
  if (!triggerVisible || !props.autoPosition || !isVisible.value) {
    return
  }

  if (entry.intersectionRatio <= props.minVisibleRatio) {
    reversePosition()
  }
}, { threshold: [props.minVisibleRatio] })

const onContainerScroll = throttleByRaf(async (ev: Event) => {
  if (!isVisible.value) {
    return
  }

  const scrollTop = getScrollElByContainer(ev.target).scrollTop
  const delta = Math.abs(scrollTop - savedScrollPosition)

  if (props.closeOnScroll && delta >= props.closeOnScrollThreshold) {
    handlePopoverHide(true)
  }

  // if (!props.autoPosition) {
  //   return
  // }

  // if (delta < props.autoPositionThreshold) {

  // }
})

function getTriggerRect() {
  triggerRect = triggerRef.value!.getBoundingClientRect()
  viewportRect = document.documentElement.getBoundingClientRect()

  if (!wrapperRect && wrapperRef.value) {
    wrapperRect = wrapperRef.value.getBoundingClientRect()
  }
}

async function handlePopoverShow(immediate: boolean = false) {
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
    }, immediate ? 0 : props.showDelay)
  })

  openPopover()

  await nextTick()

  getTriggerRect()
  updateContentPosition()

  savedScrollPosition = getScrollElByContainer(scrollContainer).scrollTop

  if (props.closeOnPressEscape) {
    optimizedOn(document, 'keydown', onPopoverKeystroke)
  }
  optimizedOn(scrollContainer, 'scroll', onContainerScroll, { passive: true })
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

  await closePopover()

  wrapperRect = null

  if (props.closeOnPressEscape) {
    optimizedOff(document, 'keydown', onPopoverKeystroke)
  }
  optimizedOff(scrollContainer, 'scroll', onContainerScroll)
}

// on press escape key
function onPopoverKeystroke(ev: KeyboardEvent) {
  if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
    return
  }

  if (ev.key !== 'Escape' || !props.closeOnPressEscape) {
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

  // 如果 content 可交互并且触发方式中没有 hover 表示需要通过其他方式来关闭
  if (props.enterable && !triggerMethods.value.includes('hover')) {
    return
  }

  handlePopoverHide()
}

async function updateContentPosition() {
  if (!wrapperRect) {
    return
  }

  const { offset, maxWidth, zIndex, arrowColor } = props
  const { width: wrapperWidth, height: wrapperHeight } = wrapperRect!
  const { scrollLeft, scrollTop, width, height } = getElementRectFromContainer(triggerRect!, viewportRect!)

  let top = ''
  let left = ''

  switch (localPosition.value) {
    case 'top':
      top = `${scrollTop - wrapperHeight}px`
      left = `${scrollLeft + width / 2 - wrapperWidth / 2}px`
      break

    case 'top-start':
      top = `${scrollTop - wrapperHeight}px`
      left = `${scrollLeft}px`
      break

    case 'top-end':
      top = `${scrollTop - wrapperHeight}px`
      left = `${scrollLeft + width - wrapperWidth}px`
      break

    case 'right':
      top = `${scrollTop + height / 2 - wrapperHeight / 2}px`
      left = `${scrollLeft + width}px`
      break

    case 'right-start':
      top = `${scrollTop}px`
      left = `${scrollLeft + width}px`
      break

    case 'right-end':
      top = `${scrollTop + height - wrapperHeight}px`
      left = `${scrollLeft + width}px`
      break

    case 'bottom':
      top = `${scrollTop + height}px`
      left = `${scrollLeft + width / 2 - wrapperWidth / 2}px`
      break

    case 'bottom-start':
      top = `${scrollTop + height}px`
      left = `${scrollLeft}px`
      break

    case 'bottom-end':
      top = `${scrollTop + height}px`
      left = `${scrollLeft + width - wrapperWidth}px`
      break

    case 'left':
      top = `${scrollTop + height / 2 - wrapperHeight / 2}px`
      left = `${scrollLeft - wrapperWidth}px`
      break

    case 'left-start':
      top = `${scrollTop}px`
      left = `${scrollLeft - wrapperWidth}px`
      break

    case 'left-end':
      top = `${scrollTop + height - wrapperHeight}px`
      left = `${scrollLeft - wrapperWidth}px`
      break
  }

  wrapperStyle.value = {
    left,
    top,
    zIndex,
    '--popover-bg': arrowColor,
    '--popover-offset': getCssUnitValue(offset),
    '--popover-max-width': getCssUnitValue(maxWidth),
    '--popover-arrow-offset': `${offset - 5}px`,
  }
}

function reversePosition() {
  const positionsMap = {
    top: 'bottom',
    left: 'right',
    right: 'left',
    bottom: 'top',
  }

  const [position, modifier = ''] = localPosition.value.split('-') as [keyof typeof positionsMap, 'start' | 'end' | '']

  localPosition.value = `${positionsMap[position]}${modifier ? '-' : ''}${modifier}` as ComponentPosition

  updateContentPosition()
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
  handler: typeof optimizedOn | typeof optimizedOff,
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

function onResizeUpdatePosition() {
  if (!isVisible.value || !props.autoPosition) {
    return
  }

  // TODO: update arrow position with trigger rect
  getTriggerRect()
  updateContentPosition()
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
    updateTriggerEvents(oldMethods, oldDom, optimizedOff)

    updateTriggerEvents(newMethods, newDom, optimizedOn)
  },
)

onMounted(() => {
  if (isServer) {
    return
  }

  scrollContainer = getScrollContainer(triggerRef.value!)
  optimizedOn(window, 'resize', onResizeUpdatePosition)
})

onBeforeUnmount(() => {
  triggerRect = null
  viewportRect = null

  optimizedOff(window, 'resize', onResizeUpdatePosition)
  optimizedOff(scrollContainer, 'scroll', onContainerScroll)
})

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
        :data-show-transition="showTransition"
        :data-hide-transition="hideTransition"
        :data-transition-type="transitionType"
        class="pxd-popover--container sm:max-w-(--popover-max-width) absolute isolate w-max max-w-full motion-reduce:data-[visible=false]:hidden"
        @pointerenter="onContentPointerEnter"
        @pointerleave="onContentPointerLeave"
      >
        <i v-if="showArrow" class="pxd-popover--arrow absolute z-1" />
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
  &[data-visible="true"][data-show-transition="true"][data-transition-type="fade"] {
    animation: popover-fade-show var(--default-transition-duration) var(--default-transition-timing-function) forwards;
  }

  &[data-visible="false"][data-hide-transition="true"][data-transition-type="fade"] {
    animation: popover-fade-hide var(--default-transition-duration) var(--default-transition-timing-function) forwards;
  }

  &[data-visible="true"][data-show-transition="true"][data-transition-type="fade-scale"] {
    animation: popover-fade-scale-show var(--default-transition-duration) var(--default-transition-timing-function) forwards;
  }

  &[data-visible="false"][data-hide-transition="true"][data-transition-type="fade-scale"] {
    animation: popover-fade-scale-hide var(--default-transition-duration) var(--default-transition-timing-function) forwards;
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
    transform-origin: 100% 50%;
  }
  &[data-position='left-start'] {
    transform-origin: 100% 0;
  }
  &[data-position='left-end'] {
    transform-origin: 100% 100%;
  }

  &[data-position='right'] {
    transform-origin: 0 50%;
  }
  &[data-position='right-start'] {
    transform-origin: 0 0;
  }
  &[data-position='right-end'] {
    transform-origin: 0 100%;
  }

  &[data-position^='top'] {
    padding-bottom: var(--popover-offset);
  }

  &[data-position^='bottom'] {
    padding-top: var(--popover-offset);
  }

  &[data-position^='left'] {
    padding-right: var(--popover-offset);
  }

  &[data-position^='right'] {
    padding-left: var(--popover-offset);
  }

  .pxd-popover--arrow {
    border-style: solid;
  }

  &[data-position="top"] .pxd-popover--arrow,
  &[data-position="top-start"] .pxd-popover--arrow,
  &[data-position="top-end"] .pxd-popover--arrow {
    bottom: var(--popover-arrow-offset);
    border-width: 6px 6px 0;
    border-color: var(--popover-bg) transparent transparent;
  }

  &[data-position='bottom'] .pxd-popover--arrow,
  &[data-position='bottom-start'] .pxd-popover--arrow,
  &[data-position='bottom-end'] .pxd-popover--arrow {
    top: var(--popover-arrow-offset);
    border-width: 0 6px 6px;
    border-color: transparent transparent var(--popover-bg);
  }

  &[data-position='left'] .pxd-popover--arrow,
  &[data-position='left-start'] .pxd-popover--arrow,
  &[data-position='left-end'] .pxd-popover--arrow {
    right: var(--popover-arrow-offset);
    border-width: 6px 0 6px 6px;
    border-color: transparent transparent transparent var(--popover-bg);
  }

  &[data-position='right'] .pxd-popover--arrow,
  &[data-position='right-start'] .pxd-popover--arrow,
  &[data-position='right-end'] .pxd-popover--arrow {
    left: var(--popover-arrow-offset);
    border-width: 6px 6px 6px 0;
    border-color: transparent var(--popover-bg) transparent transparent;
  }

  &[data-position='top'] .pxd-popover--arrow,
  &[data-position='bottom'] .pxd-popover--arrow {
    left: 50%;
    transform: translateX(-50%);
  }

  &[data-position='left'] .pxd-popover--arrow,
  &[data-position='right'] .pxd-popover--arrow {
    top: 50%;
    transform: translateY(-50%);
  }

  &[data-position='left-start'] .pxd-popover--arrow,
  &[data-position='right-start'] .pxd-popover--arrow {
    top: 16px;
  }

  &[data-position='left-end'] .pxd-popover--arrow,
  &[data-position='right-end'] .pxd-popover--arrow {
    bottom: 16px;
  }

  &[data-position='top-start'] .pxd-popover--arrow,
  &[data-position='bottom-start'] .pxd-popover--arrow {
    left: 16px;
  }

  &[data-position='top-end'] .pxd-popover--arrow,
  &[data-position='bottom-end'] .pxd-popover--arrow {
    right: 16px;
  }
}
</style>
