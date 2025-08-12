<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { PopoverTrigger } from '../../types/components/popover'
import type { BasePosition, ComponentClass, ComponentPosition, Nullable } from '../../types/shared'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useDelayDestroy } from '../../composables/use-delay-destroy'
import {
  getElementRectFromContainer,
  getScrollContainer,
  getScrollElByContainer,
  getScrollPositions,
} from '../../utils/dom'
import { off, on, optimizedOff, optimizedOn } from '../../utils/events'
import { throttleByRaf } from '../../utils/fn'
import { toArray } from '../../utils/format'
import { isServer } from '../../utils/is'
import PTeleport from '../teleport/index.vue'

interface Props {
  zIndex?: number
  offset?: number
  content?: string
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
  destroyDelay?: number
  autoPosition?: boolean
  scrollHidden?: boolean
  triggerClass?: ComponentClass
  popoverClass?: ComponentClass
  triggerStyle?: CSSProperties | string
  popoverStyle?: CSSProperties | string
  transitionName?: string
  showTransition?: boolean
  hideTransition?: boolean
  /** 最小可见比例(0~1), 仅当前可见区域比例小于该阈值时才会触发滚动过程中的自适应翻转 */
  minVisibleRatio?: number
  closeOnPressEscape?: boolean
  /** 自动调整位置的阈值, 当滚动距离超过该值时, 自动调整位置, 单位: px */
  autoPositionThreshold?: number
  /** 滚动隐藏的阈值, 当滚动距离超过该值时, 自动隐藏弹窗, 单位: px */
  scrollHiddenThreshold?: number
}

defineOptions({
  name: 'PPopover',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    zIndex: 5,
    offset: 10,
    trigger: () => ['hover'],
    position: 'bottom',
    maxWidth: 300,
    showDelay: 300,
    hideDelay: 300,
    showArrow: false,
    arrowColor: 'hsl(var(--primary))',
    autoPosition: true,
    destroyDelay: 2000,
    scrollHidden: false,
    showTransition: true,
    hideTransition: true,
    minVisibleRatio: 0.68,
    closeOnPressEscape: false,
    autoPositionThreshold: 30,
    scrollHiddenThreshold: 150,
  },
)

const emits = defineEmits<{
  'show': []
  'hide': []
  'trigger-keydown': [KeyboardEvent]
}>()

const triggerRect = shallowRef<DOMRect>()

let viewportRect: DOMRect | null = null
let scrollContainer: ReturnType<typeof getScrollContainer>

let showPopoverTimer: ReturnType<typeof setTimeout>
let hidePopoverTimer: ReturnType<typeof setTimeout>

const triggerRef = shallowRef<HTMLElement>()
const wrapperRef = shallowRef<HTMLElement>()
const localPosition = shallowRef(props.position)

const wrapperStyle = shallowRef<CSSProperties>({
  left: '-100%',
  top: '-100%',
})

const {
  render: isRender,
  visible: isVisible,
  open: openPopover,
  close: closePopover,
} = useDelayDestroy({
  default: props.visible,
  delay: props.destroyDelay,
})

const triggerMethods = computed<PopoverTrigger[]>(() => toArray(props.trigger))

const computedTransitionName = computed(() =>
  props.transitionName ?? `pxd-transition--popover-${localPosition.value.split('-')[0]}`,
)

let savedScrollTop: number = 0

const onContainerScroll = throttleByRaf(async (ev: Event) => {
  if (!isVisible.value) {
    return
  }

  const scrollTop = getScrollElByContainer(ev.target).scrollTop
  const delta = Math.abs(scrollTop - savedScrollTop)

  if (props.scrollHidden && delta >= props.scrollHiddenThreshold) {
    handlePopoverHide(true)
    return
  }

  if (!props.autoPosition) {
    return
  }

  if (delta < props.autoPositionThreshold) {
    return
  }

  getTriggerRect()
  savedScrollTop = scrollTop

  // 先回到初始位置
  localPosition.value = props.position
  updateContentPosition()

  // 等待样式生效后再判断遮挡，再决定是否翻转
  await nextTick()
  const scrollInfo = getScrollPositions(scrollContainer)
  const containerRect = wrapperRef.value!.getBoundingClientRect()
  const overlapping = getOverlapping(
    viewportRect!,
    containerRect,
    scrollInfo,
  )

  // 当可见比例低于阈值时才触发翻转，避免轻微遮挡造成频繁翻转
  const visibleRatio = getVisibleRatio(viewportRect!, containerRect, scrollInfo)
  if (visibleRatio >= props.minVisibleRatio) {
    return
  }

  if (overlapping.isOverlapping) {
    applyAutoPosition(overlapping)
    updateContentPosition()
  }
})

function getTriggerRect() {
  triggerRect.value = triggerRef.value!.getBoundingClientRect()
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

async function handlePopoverShow(immediate: boolean = false) {
  await new Promise((resolve) => {
    getTriggerRect()
    clearTimeout(hidePopoverTimer)
    clearTimeout(showPopoverTimer)

    showPopoverTimer = setTimeout(() => {
      localPosition.value = props.position
      updateContentPosition()
      openPopover()
      resolve(true)
      emits('show')
    }, immediate ? 0 : props.showDelay)
  })

  savedScrollTop = getScrollElByContainer(scrollContainer).scrollTop
  on(scrollContainer, 'scroll', onContainerScroll, { passive: true })

  if (!props.autoPosition) {
    return
  }

  await nextTick()

  // 渲染以后判断初始是否被遮挡, 如果被遮挡则调换位置
  const overlapping = getOverlapping(
    viewportRect!,
    wrapperRef.value!.getBoundingClientRect(),
    getScrollPositions(scrollContainer),
  )

  if (overlapping.isOverlapping) {
    applyAutoPosition(overlapping)
    updateContentPosition()
  }
}

async function handlePopoverHide(immediate: boolean = false) {
  await new Promise((resolve) => {
    clearTimeout(showPopoverTimer)
    clearTimeout(hidePopoverTimer)

    hidePopoverTimer = setTimeout(() => {
      closePopover()
      resolve(true)
      emits('hide')
    }, immediate ? 0 : props.hideDelay)
  })

  off(scrollContainer, 'scroll', onContainerScroll)
  off(document, 'click', onClickOutsideToHide)
  off(document, 'contextmenu', onTriggerContextmenu)
}

async function onTriggerClick() {
  if (props.disabled) {
    return
  }

  if (isVisible.value) {
    off(document, 'click', onClickOutsideToHide)
    await handlePopoverHide()

    return
  }

  on(document, 'click', onClickOutsideToHide)
  await handlePopoverShow()
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

async function onTriggerContextmenu(ev: MouseEvent) {
  if (props.disabled) {
    return
  }

  ev.preventDefault()

  if (isVisible.value) {
    await handlePopoverHide()
    off(document, 'click', onClickOutsideToHide)
    off(document, 'contextmenu', onTriggerContextmenu)

    return
  }

  await handlePopoverShow()
  on(document, 'click', onClickOutsideToHide)
  on(document, 'contextmenu', onTriggerContextmenu)
}

function onClickOutsideToHide(ev: MouseEvent) {
  const target = ev.target as HTMLElement

  if (
    !triggerRef.value?.contains(target)
    && !wrapperRef.value?.contains(target)
  ) {
    handlePopoverHide()
  }
}

function onContentPointerEnter() {
  if (props.disabled) {
    return
  }

  if (!props.enterable) {
    return
  }

  handlePopoverShow()
}

function onContentPointerLeave() {
  if (props.disabled) {
    return
  }

  if (!triggerMethods.value.includes('hover')) {
    return
  }

  handlePopoverHide()
}

function updateContentPosition() {
  const { offset, maxWidth, zIndex, arrowColor } = props
  const { scrollLeft, scrollTop, width, height } = getElementRectFromContainer(triggerRect.value!, viewportRect!)

  const position = localPosition.value
  const isVertical = position.startsWith('top') || position.startsWith('bottom')
  const isHorizontal = position.startsWith('left') || position.startsWith('right')

  let top = ''
  let left = ''
  let translateX = '0'
  let translateY = '0'

  if (isVertical) {
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
    }
  } else if (isHorizontal) {
    if (position === 'left') {
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
  }

  wrapperStyle.value = {
    left,
    top,
    zIndex,
    'transform': `translate3d(${translateX}, ${translateY}, 0)`,
    '--color': arrowColor,
    '--offset': `${offset}px`,
    '--max-width': `${maxWidth}px`,
    '--arrow-offset': `${offset - 5}px`,
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
  click: [
    ['click', onTriggerClick],
  ],
  focus: [
    ['focusin', onTriggerFocusin],
    ['focusout', onTriggerFocusout],
  ],
  hover: [
    ['pointerenter', onTriggerPointerEnter],
    ['pointerleave', onTriggerPointerLeave],
  ],
  contextmenu: [
    ['contextmenu', onTriggerContextmenu],
  ],
} as const

function updateTriggerEvents(
  methods: PopoverTrigger[],
  dom: Nullable<EventTarget>,
  handler: typeof on | typeof off,
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

function onTriggerKeydown(ev: KeyboardEvent) {
  if (!isVisible.value) {
    return
  }

  emits('trigger-keydown', ev)

  if (!props.closeOnPressEscape) {
    return
  }

  if (ev.key !== 'Escape') {
    return
  }

  ev.stopPropagation()

  handlePopoverHide()
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
    updateTriggerEvents(oldMethods, oldDom, off)

    updateTriggerEvents(newMethods, newDom, on)
  },
)

onMounted(() => {
  if (isServer) {
    return
  }

  scrollContainer = getScrollContainer(triggerRef.value!, true)
  optimizedOn(window, 'resize', onResizeUpdatePosition)
})

onBeforeUnmount(() => {
  viewportRect = null

  clearTimeout(showPopoverTimer)
  clearTimeout(hidePopoverTimer)
  off(document, 'click', onClickOutsideToHide)
  off(document, 'contextmenu', onTriggerContextmenu)
  off(scrollContainer, 'scroll', onContainerScroll)
  optimizedOff(window, 'resize', onResizeUpdatePosition)
})

defineExpose({
  show: handlePopoverShow,
  hide: handlePopoverHide,
})
</script>

<template>
  <div class="pxd-popover relative inline-flex w-max">
    <div
      ref="triggerRef"
      class="pxd-popover--trigger active:select-none"
      :class="triggerClass"
      :style="triggerStyle"
      @contextmenu.prevent
      @keydown="onTriggerKeydown"
    >
      <slot />
    </div>

    <PTeleport>
      <Transition mode="out-in" :name="computedTransitionName" :class="{ showTransition, hideTransition }">
        <div
          v-if="isRender"
          v-show="isVisible"
          ref="wrapperRef"
          :style="wrapperStyle"
          :data-enterable="enterable"
          :data-position="localPosition"
          class="pxd-popover--container sm:max-w-(--max-width) absolute isolate w-max max-w-full data-[enterable=false]:pointer-events-none"
          @pointerenter="onContentPointerEnter"
          @pointerleave="onContentPointerLeave"
        >
          <i v-if="showArrow" class="pxd-popover--arrow absolute z-1" />
          <div class="pxd-popover--content" :class="popoverClass" :style="popoverStyle">
            <slot name="content">
              {{ content }}
            </slot>
          </div>
        </div>
      </Transition>
    </PTeleport>
  </div>
</template>

<style lang="postcss">
.pxd-popover--container {

  &[data-position^='top'] {
    padding-bottom: var(--offset);
  }

  &[data-position^='bottom'] {
    padding-top: var(--offset);
  }

  &[data-position^='left'] {
    padding-right: var(--offset);
  }

  &[data-position^='right'] {
    padding-left: var(--offset);
  }

  .pxd-popover--arrow {
    border-style: solid;
  }

  &[data-position="top"] .pxd-popover--arrow,
  &[data-position="top-start"] .pxd-popover--arrow,
  &[data-position="top-end"] .pxd-popover--arrow {
    bottom: var(--arrow-offset);
    border-width: 6px 6px 0;
    border-color: var(--color) transparent transparent;
  }

  &[data-position='bottom'] .pxd-popover--arrow,
  &[data-position='bottom-start'] .pxd-popover--arrow,
  &[data-position='bottom-end'] .pxd-popover--arrow {
    top: var(--arrow-offset);
    border-width: 0 6px 6px;
    border-color: transparent transparent var(--color);
  }

  &[data-position='left'] .pxd-popover--arrow,
  &[data-position='left-start'] .pxd-popover--arrow,
  &[data-position='left-end'] .pxd-popover--arrow {
    right: var(--arrow-offset);
    border-width: 6px 0 6px 6px;
    border-color: transparent transparent transparent var(--color);
  }

  &[data-position='right'] .pxd-popover--arrow,
  &[data-position='right-start'] .pxd-popover--arrow,
  &[data-position='right-end'] .pxd-popover--arrow {
    left: var(--arrow-offset);
    border-width: 6px 6px 6px 0;
    border-color: transparent var(--color) transparent transparent;
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

.showTransition.pxd-transition--popover-top-enter-active,
.hideTransition.pxd-transition--popover-top-leave-active,
.showTransition.pxd-transition--popover-bottom-enter-active,
.hideTransition.pxd-transition--popover-bottom-leave-active,
.showTransition.pxd-transition--popover-left-enter-active,
.hideTransition.pxd-transition--popover-left-leave-active,
.showTransition.pxd-transition--popover-right-enter-active,
.hideTransition.pxd-transition--popover-right-leave-active {
  transition: opacity var(--default-transition-duration) var(--default-transition-timing-function);
}

.showTransition.pxd-transition--popover-top-enter-from,
.hideTransition.pxd-transition--popover-top-leave-to,
.showTransition.pxd-transition--popover-bottom-enter-from,
.hideTransition.pxd-transition--popover-bottom-leave-to,
.showTransition.pxd-transition--popover-left-enter-from,
.hideTransition.pxd-transition--popover-left-leave-to,
.showTransition.pxd-transition--popover-right-enter-from,
.hideTransition.pxd-transition--popover-right-leave-to {
  opacity: 0;
}
</style>
