<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { PopoverTrigger } from '../../types/components/popover'
import type { BasePosition, ComponentClass, ComponentPosition, Nullable } from '../../types/shared'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useDelayDestroy } from '../../composables/use-delay-destroy'
import { useOutsideClick } from '../../composables/use-outside-click'
import { debounce } from '../../utils/debounce'
import {
  getElementRectFromContainer,
  getScrollContainer,
  getScrollElByContainer,
  getScrollPositions,
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
  transitionName?: string
  /** 最小可见比例(0~1), 仅当前可见区域比例小于该阈值时才会触发滚动过程中的自适应翻转 */
  minVisibleRatio?: number
  closeOnPressEscape?: boolean
  /** 自动调整位置的阈值, 当滚动距离超过该值时, 自动调整位置, 单位: px */
  autoPositionThreshold?: number
  /** 滚动隐藏的阈值, 当滚动距离超过该值时, 自动隐藏弹窗, 单位: px */
  closeOnScrollThreshold?: number
  disabledShowTransition?: boolean
  disabledHideTransition?: boolean
}

defineOptions({
  name: 'PPopover',
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
    minVisibleRatio: 0.88,
    autoPositionThreshold: 30,
    closeOnScrollThreshold: 150,
    transitionName: 'pxd-transition--fade-scale',
  },
)

const emits = defineEmits<{
  'show': []
  'hide': []
  'outside-click': [MouseEvent]
  'trigger-click': [PointerEvent]
  'visible-change': [visible: boolean]
}>()

let triggerRect: DOMRect | null = null
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
} = useDelayDestroy({
  default: props.visible,
  delay: 3000,
})

useOutsideClick(wrapperRef, {
  isEnabled: () => {
    return isVisible.value && (
      triggerMethods.value.includes('click')
      || triggerMethods.value.includes('manual')
      || triggerMethods.value.includes('contextmenu')
    )
  },
  isOutside: (ev) => {
    return !triggerRef.value?.contains(ev.target as HTMLElement)
  },
  onTrigger: debounce((ev) => {
    emits('outside-click', ev)
    handlePopoverHide()
  }, 500, { edges: ['leading'] }),
})

const onContainerScroll = throttleByRaf(async (ev: Event) => {
  if (!isVisible.value) {
    return
  }

  const scrollTop = getScrollElByContainer(ev.target).scrollTop
  const delta = Math.abs(scrollTop - savedScrollPosition)

  if (props.closeOnScroll && delta >= props.closeOnScrollThreshold) {
    handlePopoverHide(true)
    return
  }

  if (!props.autoPosition) {
    return
  }

  if (delta < props.autoPositionThreshold) {
    return
  }

  savedScrollPosition = scrollTop

  // 先回到初始位置
  localPosition.value = props.position
  updateContentPosition()

  handleDirectionInvertIfNeed()
})

function getTriggerRect() {
  triggerRect = triggerRef.value!.getBoundingClientRect()
  viewportRect = document.documentElement.getBoundingClientRect()
}

// 判断元素在渲染后是否超出了屏幕之外
function getOverlapping(
  viewportRect: DOMRect,
  containerRect: DOMRect,
  scrollInfo: ReturnType<typeof getScrollPositions>,
) {
  const containerTop = containerRect.top - scrollInfo.scrollTop
  const containerBottom = containerRect.bottom - scrollInfo.scrollTop
  const containerLeft = containerRect.left - scrollInfo.scrollLeft
  const containerRight = containerRect.right - scrollInfo.scrollLeft

  const isTopOverlapping = containerTop < viewportRect.top
  const isBottomOverlapping = containerBottom > viewportRect.bottom
  const isLeftOverlapping = containerLeft < viewportRect.left
  const isRightOverlapping = containerRight > viewportRect.right

  return {
    isOverlapping: isTopOverlapping || isBottomOverlapping || isLeftOverlapping || isRightOverlapping,
    top: isTopOverlapping,
    bottom: isBottomOverlapping,
    left: isLeftOverlapping,
    right: isRightOverlapping,
  }
}

// 计算容器在视口内的可见比例(面积占比: 0~1)
function getVisibleRatio(
  viewportRect: DOMRect,
  containerRect: DOMRect,
  scrollInfo: ReturnType<typeof getScrollPositions>,
) {
  const containerTop = containerRect.top - scrollInfo.scrollTop
  const containerBottom = containerRect.bottom - scrollInfo.scrollTop
  const containerLeft = containerRect.left - scrollInfo.scrollLeft
  const containerRight = containerRect.right - scrollInfo.scrollLeft

  const visibleLeft = Math.max(containerLeft, viewportRect.left)
  const visibleRight = Math.min(containerRight, viewportRect.right)
  const visibleTop = Math.max(containerTop, viewportRect.top)
  const visibleBottom = Math.min(containerBottom, viewportRect.bottom)

  const visibleWidth = Math.max(0, visibleRight - visibleLeft)
  const visibleHeight = Math.max(0, visibleBottom - visibleTop)

  const visibleArea = visibleWidth * visibleHeight
  const totalArea = Math.max(1, containerRect.width * containerRect.height)

  return visibleArea / totalArea
}

// 处理是否需要翻转方向
async function handleDirectionInvertIfNeed() {
  await nextTick()

  const scrollInfo = getScrollPositions(scrollContainer)
  const containerRect = wrapperRef.value!.getBoundingClientRect()

  // 当可见比例低于阈值时才触发翻转，避免轻微遮挡造成频繁翻转
  const visibleRatio = getVisibleRatio(viewportRect!, containerRect, scrollInfo)
  if (visibleRatio >= props.minVisibleRatio) {
    return
  }

  // 渲染以后判断初始是否被遮挡, 如果被遮挡则调换位置
  const overlapping = getOverlapping(
    viewportRect!,
    containerRect,
    scrollInfo,
  )

  if (overlapping.isOverlapping) {
    applyAutoPosition(overlapping)
    updateContentPosition()
  }
}

async function handlePopoverShow(immediate: boolean = false) {
  if (showPopoverTimer) {
    return
  }

  getTriggerRect()

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

  localPosition.value = props.position
  updateContentPosition()

  await openPopover()

  emits('show')
  emits('visible-change', true)

  savedScrollPosition = getScrollElByContainer(scrollContainer).scrollTop
  optimizedOn(scrollContainer, 'scroll', onContainerScroll, { passive: true })

  if (!props.autoPosition) {
    return
  }

  handleDirectionInvertIfNeed()
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

  optimizedOff(scrollContainer, 'scroll', onContainerScroll)

  await closePopover()

  emits('hide')
  emits('visible-change', false)
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

  // 如果 content 不可交互或者 content 已经关闭了但是还在 transition 的动画中
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

function updateContentPosition() {
  const { offset, maxWidth, zIndex, arrowColor } = props
  const { scrollLeft, scrollTop, width, height } = getElementRectFromContainer(triggerRect!, viewportRect!)

  const position = localPosition.value

  let top = ''
  let left = ''
  let translateX = '0'
  let translateY = '0'

  if (position === 'top') {
    top = `${scrollTop}px`
    left = `${scrollLeft + width / 2}px`

    translateX = '-50%'
    translateY = '-100%'
  } else if (position === 'bottom') {
    top = `${scrollTop + height}px`
    left = `${scrollLeft + width / 2}px`

    translateX = '-50%'
  } else if (position === 'top-start') {
    top = `${scrollTop}px`
    left = `${scrollLeft}px`

    translateY = '-100%'
  } else if (position === 'top-end') {
    top = `${scrollTop}px`
    left = `${scrollLeft + width}px`

    translateX = '-100%'
    translateY = '-100%'
  } else if (position === 'bottom-start') {
    top = `${scrollTop + height}px`
    left = `${scrollLeft}px`
  } else if (position === 'bottom-end') {
    top = `${scrollTop + height}px`
    left = `${scrollLeft + width}px`
    translateX = '-100%'
  } else if (position === 'left') {
    top = `${scrollTop + height / 2}px`
    left = `${scrollLeft}px`

    translateX = '-100%'
    translateY = '-50%'
  } else if (position === 'right') {
    top = `${scrollTop + height / 2}px`
    left = `${scrollLeft + width}px`

    translateX = '0'
    translateY = '-50%'
  } else if (position === 'left-start') {
    top = `${scrollTop}px`
    left = `${scrollLeft}px`

    translateX = '-100%'
    translateY = '0'
  } else if (position === 'left-end') {
    top = `${scrollTop + height}px`
    left = `${scrollLeft}px`

    translateX = '-100%'
    translateY = '-100%'
  } else if (position === 'right-start') {
    top = `${scrollTop}px`
    left = `${scrollLeft + width}px`
  } else if (position === 'right-end') {
    top = `${scrollTop + height}px`
    left = `${scrollLeft + width}px`

    translateX = '0'
    translateY = '-100%'
  }

  wrapperStyle.value = {
    left,
    top,
    zIndex,
    'transform': `translate3d(${translateX}, ${translateY}, 0)`,
    '--popover-bg': arrowColor,
    '--popover-offset': getCssUnitValue(offset),
    '--popover-max-width': getCssUnitValue(maxWidth),
    '--popover-arrow-offset': `${offset - 5}px`,
  }
}

/**
 * 当屏幕可用空间不足时调整位置, 优先保证最大的内容可见度:
 * - top 被遮挡 → bottom
 * - bottom 被遮挡 → top
 * - left 被遮挡 → top（优先向上）
 * - right 被遮挡 → top（优先向上）
 * @param overlapping 是否被遮挡
 */
function applyAutoPosition(overlapping?: ReturnType<typeof getOverlapping>) {
  if (!overlapping) {
    localPosition.value = props.position
    return
  }

  const currentPosition = localPosition.value
  const [position, modifier] = currentPosition.includes('-')
    ? currentPosition.split('-') as [BasePosition, string]
    : [currentPosition as BasePosition, '']

  const flipTargetMap: Record<BasePosition, BasePosition> = {
    top: 'bottom',
    bottom: 'top',
    left: 'top',
    right: 'top',
  }

  let newPosition = position
  let newModifier = modifier

  if (overlapping[position]) {
    newPosition = flipTargetMap[position]
  }

  // 根据“新方向”的轴向来计算修饰符（start/end），以保证对齐更贴边更可见
  if (['left', 'right'].includes(newPosition)) {
    if (overlapping.top) {
      newModifier = 'start'
    } else if (overlapping.bottom) {
      newModifier = 'end'
    }
  } else if (['top', 'bottom'].includes(newPosition)) {
    if (overlapping.left) {
      newModifier = 'start'
    } else if (overlapping.right) {
      newModifier = 'end'
    }
  }

  localPosition.value = (
    newModifier
      ? `${newPosition}-${newModifier}`
      : newPosition
  ) as ComponentPosition
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
    // unbind old trigger events
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
    @contextmenu.prevent="onTriggerContextmenu"
    @click="onTriggerClick"
  >
    <slot />

    <PTeleport>
      <Transition
        appear
        mode="out-in"
        :name="transitionName"
        :class="{ disabledShowTransition, disabledHideTransition }"
      >
        <div
          v-if="isRender"
          v-show="isVisible"
          ref="wrapperRef"
          :class="wrapperClass"
          :style="wrapperStyle"
          :data-enterable="enterable"
          :data-position="localPosition"
          class="pxd-popover--container sm:max-w-(--popover-max-width) absolute isolate w-max max-w-full"
          @pointerenter="onContentPointerEnter"
          @pointerleave="onContentPointerLeave"
        >
          <i v-if="showArrow" class="pxd-popover--arrow absolute z-1" />
          <div class="pxd-popover--content" :class="contentClass" :style="contentStyle">
            <slot name="content" />
          </div>
        </div>
      </Transition>
    </PTeleport>
  </div>
</template>

<style lang="postcss">
.pxd-popover--container {
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
    transform-origin: right center;
  }
  &[data-position='left-start'] {
    transform-origin: right left;
  }
  &[data-position='left-end'] {
    transform-origin: right right;
  }

  &[data-position='right'] {
    transform-origin: left center;
  }
  &[data-position='right-start'] {
    transform-origin: left left;
  }
  &[data-position='right-end'] {
    transform-origin: left right;
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

.disabledShowTransition[class*="-enter-active"],
.disabledHideTransition[class*="-leave-active"] {
  --default-transition-duration: 0 !important
}
</style>
