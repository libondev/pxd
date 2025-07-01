<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { ComponentBasePosition, ComponentPosition, PopoverTrigger } from '../../types/components'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useDelayDestroy } from '../../composables/useDelayDestroy'
import { getElementRectFromContainer, getScrollContainer, getScrollPositions } from '../../utils/dom'
import { off, on } from '../../utils/events'
import { throttleByRaf } from '../../utils/fn'
import { toArray } from '../../utils/format'
import { isClient } from '../../utils/is'
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
  triggerClass?: string
  popoverClass?: string
  destroyDelay?: number
  scrollHidden?: boolean
  popoverStyle?: CSSProperties | string
  transitionName?: string
  showTransition?: boolean
  hideTransition?: boolean
  translateOffset?: string | number
}

interface PopoverContainerStyle extends CSSProperties {
  'top': string
  'left': string
  'transform': string
  'max-width': string
  '--offset': string
  '--arrow-color': string
}

defineOptions({
  name: 'PPopover',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    zIndex: 10,
    offset: 10,
    trigger: () => ['hover'],
    position: 'bottom',
    maxWidth: 300,
    showDelay: 300,
    hideDelay: 300,
    showArrow: true,
    arrowColor: 'var(--color-gray-1000)',
    destroyDelay: 2000,
    scrollHidden: false,
    translateOffset: 0,
    showTransition: true,
    hideTransition: true,
  },
)

const emits = defineEmits<{
  show: []
  hide: []
}>()

let triggerRect: DOMRect | null = null
let viewportRect: DOMRect | null = null
let scrollContainer: ReturnType<typeof getScrollContainer>
let cachedContainerRect: DOMRect | null = null
let lastScrollInfo: ReturnType<typeof getScrollPositions> | null = null

let showPopoverTimer: ReturnType<typeof setTimeout>
let hidePopoverTimer: ReturnType<typeof setTimeout>

const {
  render: isRender,
  visible: isVisible,
  open: openPopover,
  close: closePopover,
} = useDelayDestroy({
  default: props.visible,
  delay: props.destroyDelay,
})

const triggerRef = shallowRef<HTMLElement>()
const containerRef = shallowRef<HTMLElement>()
const localPosition = shallowRef(props.position)
const originalPosition = shallowRef(props.position)
const containerStyle = shallowRef({
  left: '-100%',
  top: '-100%',
} as PopoverContainerStyle)

const triggerMethods = computed<PopoverTrigger[]>(() => toArray(props.trigger))

let cachedGeneralPosition: ComponentBasePosition | null = null
let cachedPositionForGeneral: string | null = null

const generalPosition = computed(() => {
  if (cachedPositionForGeneral === localPosition.value && cachedGeneralPosition) {
    return cachedGeneralPosition
  }
  cachedPositionForGeneral = localPosition.value
  cachedGeneralPosition = localPosition.value.split('-')[0] as ComponentBasePosition
  return cachedGeneralPosition
})

const transitionName = computed(() => props.transitionName ?? `pxd-transition--popover-${generalPosition.value}`)

const onContainerScroll = throttleByRaf(() => {
  if (!isVisible.value) {
    return
  }

  if (props.scrollHidden) {
    handlePopoverHide(true)
    return
  }

  // 动态调整位置
  handleDynamicPositionAdjustment()
})

// 判断 containerRef 的元素在渲染后是否超出了屏幕之外
function isContainerOverlapping(
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

function getTriggerRect() {
  triggerRect = triggerRef.value!.getBoundingClientRect()
  viewportRect = document.documentElement.getBoundingClientRect()
}

function handleDynamicPositionAdjustment() {
  if (!containerRef.value || !triggerRect || !viewportRect) {
    return
  }

  const containerRect = containerRef.value.getBoundingClientRect()
  const scrollInfo = getScrollPositions(scrollContainer)

  if (cachedContainerRect && lastScrollInfo) {
    const rectChanged = Math.abs(containerRect.top - cachedContainerRect.top) > 1
      || Math.abs(containerRect.left - cachedContainerRect.left) > 1
    const scrollChanged = Math.abs(scrollInfo.scrollTop - lastScrollInfo.scrollTop) > 5
      || Math.abs(scrollInfo.scrollLeft - lastScrollInfo.scrollLeft) > 5

    if (!rectChanged && !scrollChanged) {
      return
    }
  }

  cachedContainerRect = containerRect
  lastScrollInfo = scrollInfo

  getTriggerRect()

  // 检查当前位置是否被遮挡
  const currentOverlapping = isContainerOverlapping(viewportRect, containerRect, scrollInfo)
  let needsUpdate = false

  if (currentOverlapping.isOverlapping) {
    // 如果当前位置被遮挡，尝试调整位置
    if (localPosition.value === originalPosition.value) {
      // 当前是原始位置，需要切换到其他位置
      reverseRenderPosition(currentOverlapping)
      needsUpdate = true
    }
  } else {
    // 当前位置没有被遮挡
    if (localPosition.value !== originalPosition.value) {
      // 如果当前不是原始位置，检查原始位置是否可用
      handleOriginalPositionCheck()
      return // 避免重复更新
    }
  }

  if (needsUpdate) {
    updateContentPosition()
  }
}

// 分离原始位置检查逻辑
function handleOriginalPositionCheck() {
  const tempPosition = localPosition.value
  localPosition.value = originalPosition.value
  updateContentPosition()

  // 在下一帧检查原始位置是否仍然可用
  nextTick(() => {
    if (!containerRef.value || !viewportRect) {
      return
    }

    const newContainerRect = containerRef.value.getBoundingClientRect()
    const newOverlapping = isContainerOverlapping(viewportRect, newContainerRect, getScrollPositions(scrollContainer))

    // 原始位置仍然被遮挡，恢复到之前的位置
    if (newOverlapping.isOverlapping) {
      localPosition.value = tempPosition
      updateContentPosition()
    }

    cachedContainerRect = newContainerRect
  })
}

async function handlePopoverShow(immediate: boolean = false) {
  await new Promise((resolve) => {
    getTriggerRect()
    clearTimeout(hidePopoverTimer)
    clearTimeout(showPopoverTimer)

    showPopoverTimer = setTimeout(() => {
      localPosition.value = props.position
      originalPosition.value = props.position
      updateContentPosition()
      openPopover()
      resolve(true)
      emits('show')
    }, immediate ? 0 : props.showDelay)
  })

  // 懒绑定 scroll 事件, 减少组件在未触发时绑定事件的性能损耗
  on(scrollContainer, 'scroll', onContainerScroll, { passive: true })

  nextTick(() => {
    // 渲染以后判断初始是否被遮挡, 如果被遮挡则调换位置
    const overlapping = isContainerOverlapping(
      viewportRect!,
      containerRef.value!.getBoundingClientRect(),
      getScrollPositions(scrollContainer),
    )

    if (overlapping.isOverlapping) {
      reverseRenderPosition(overlapping)
      updateContentPosition()
    }
  })
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

  // 清理缓存
  cachedContainerRect = null
  lastScrollInfo = null
  off(scrollContainer, 'scroll', onContainerScroll)
}

async function onTriggerClick() {
  if (props.disabled) {
    return
  }

  if (isVisible.value) {
    await handlePopoverHide()
    off(document, 'click', onClickOutsideToHide)

    return
  }

  await handlePopoverShow()
  on(document, 'click', onClickOutsideToHide)
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

  if (!triggerRef.value?.contains(target) && !containerRef.value?.contains(target)) {
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
  const position = localPosition.value
  const { offset, arrowColor, maxWidth } = props
  const { scrollLeft, scrollTop, width, height } = getElementRectFromContainer(triggerRect!, viewportRect!)

  const isVertical = position.startsWith('top') || position.startsWith('bottom')
  const isHorizontal = position.startsWith('left') || position.startsWith('right')

  let top = ''
  let left = ''
  let transform = ''

  if (isVertical) {
    if (position === 'top') {
      top = `${scrollTop}px`
      left = `${scrollLeft + width / 2}px`
      transform = 'translate(-50%, -100%)'
    } else if (position === 'bottom') {
      top = `${scrollTop + height}px`
      left = `${scrollLeft + width / 2}px`
      transform = 'translate(-50%, 0)'
    } else if (position === 'top-start') {
      top = `${scrollTop}px`
      left = `${scrollLeft}px`
      transform = 'translate(0, -100%)'
    } else if (position === 'top-end') {
      top = `${scrollTop}px`
      left = `${scrollLeft + width}px`
      transform = 'translate(-100%, -100%)'
    } else if (position === 'bottom-start') {
      top = `${scrollTop + height}px`
      left = `${scrollLeft}px`
      transform = 'translate(0, 0)'
    } else if (position === 'bottom-end') {
      top = `${scrollTop + height}px`
      left = `${scrollLeft + width}px`
      transform = 'translate(-100%, 0)'
    }
  } else if (isHorizontal) {
    if (position === 'left') {
      top = `${scrollTop + height / 2}px`
      left = `${scrollLeft}px`
      transform = 'translate(-100%, -50%)'
    } else if (position === 'right') {
      top = `${scrollTop + height / 2}px`
      left = `${scrollLeft + width}px`
      transform = 'translate(0, -50%)'
    } else if (position === 'left-start') {
      top = `${scrollTop}px`
      left = `${scrollLeft}px`
      transform = 'translate(-100%, 0)'
    } else if (position === 'left-end') {
      top = `${scrollTop + height}px`
      left = `${scrollLeft}px`
      transform = 'translate(-100%, -100%)'
    } else if (position === 'right-start') {
      top = `${scrollTop}px`
      left = `${scrollLeft + width}px`
      transform = 'translate(0, 0)'
    } else if (position === 'right-end') {
      top = `${scrollTop + height}px`
      left = `${scrollLeft + width}px`
      transform = 'translate(0, -100%)'
    }
  }

  containerStyle.value = {
    left,
    top,
    transform,
    'max-width': `${maxWidth || triggerRect!.width}px`,
    '--offset': `${offset}px`,
    '--arrow-color': arrowColor,
  }
}

// 当屏幕可用空间不足时反转方向
function reverseRenderPosition(overlapping?: ReturnType<typeof isContainerOverlapping>) {
  if (!overlapping) {
    localPosition.value = props.position
    return
  }

  const currentPosition = localPosition.value
  const [position, modifier] = currentPosition.includes('-')
    ? currentPosition.split('-') as [ComponentBasePosition, string]
    : [currentPosition as ComponentBasePosition, '']

  const oppositePositionMap = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  } as const

  let newPosition = position
  let newModifier = modifier

  if (overlapping[position]) {
    newPosition = oppositePositionMap[position]
  }

  if (['left', 'right'].includes(position)) {
    if (overlapping.top) {
      newModifier = 'start'
    } else if (overlapping.bottom) {
      newModifier = 'end'
    }
  } else if (['top', 'bottom'].includes(position)) {
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
  dom: HTMLElement,
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

watch<[HTMLElement | undefined, PopoverTrigger[]]>(
  () => [triggerRef.value, triggerMethods.value],
  ([newDom, newMethods], [oldDom, oldMethods]) => {
    // unbind old trigger events
    if (oldDom) {
      updateTriggerEvents(oldMethods, oldDom, off)
    }

    if (newDom) {
      updateTriggerEvents(newMethods, newDom, on)
    }
  },
)

onMounted(() => {
  if (!isClient) {
    return
  }

  scrollContainer = getScrollContainer(triggerRef.value!, true)
})

onBeforeUnmount(() => {
  triggerRect = null
  viewportRect = null
  cachedContainerRect = null
  lastScrollInfo = null
  cachedGeneralPosition = null
  cachedPositionForGeneral = null

  clearTimeout(showPopoverTimer)
  clearTimeout(hidePopoverTimer)
  off(document, 'click', onClickOutsideToHide)
  off(document, 'contextmenu', onTriggerContextmenu)
  off(scrollContainer, 'scroll', onContainerScroll)
})

defineExpose({
  show: handlePopoverShow,
  hide: handlePopoverHide,
})
</script>

<template>
  <div class="pxd-popover relative inline-flex w-max">
    <div ref="triggerRef" class="pxd-popover__trigger" :class="triggerClass">
      <slot />
    </div>

    <PTeleport>
      <Transition
        mode="out-in" :name="transitionName" :class="{ showTransition, hideTransition }"
        :style="{ '--translate-offset': translateOffset, zIndex }"
      >
        <div
          v-if="isRender" v-show="isVisible" ref="containerRef" :style="containerStyle"
          :data-position="localPosition" class="pxd-popover__container isolate absolute w-max"
          :class="[{ 'pointer-events-none': !enterable, 'show-arrow': showArrow }]"
          @pointerenter="onContentPointerEnter" @pointerleave="onContentPointerLeave"
        >
          <div class="pxd-popover__content" :class="popoverClass" :style="popoverStyle">
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
.pxd-popover__container {

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

  &.show-arrow {
    .pxd-popover__content::after {
      content: '';
      position: absolute;
      border-style: solid;
      z-index: 1;
    }

    &[data-position="top"] .pxd-popover__content::after,
    &[data-position="top-start"] .pxd-popover__content::after,
    &[data-position="top-end"] .pxd-popover__content::after {
      bottom: calc(var(--offset) - 4px);
      border-width: 6px 6px 0;
      border-color: var(--arrow-color) transparent transparent;
    }

    &[data-position='bottom'] .pxd-popover__content::after,
    &[data-position='bottom-start'] .pxd-popover__content::after,
    &[data-position='bottom-end'] .pxd-popover__content::after {
      top: calc(var(--offset) - 4px);
      border-width: 0 6px 6px;
      border-color: transparent transparent var(--arrow-color);
    }

    &[data-position='left'] .pxd-popover__content::after,
    &[data-position='left-start'] .pxd-popover__content::after,
    &[data-position='left-end'] .pxd-popover__content::after {
      right: calc(var(--offset) - 4px);
      border-width: 6px 0 6px 6px;
      border-color: transparent transparent transparent var(--arrow-color);
    }

    &[data-position='right'] .pxd-popover__content::after,
    &[data-position='right-start'] .pxd-popover__content::after,
    &[data-position='right-end'] .pxd-popover__content::after {
      left: calc(var(--offset) - 4px);
      border-width: 6px 6px 6px 0;
      border-color: transparent var(--arrow-color) transparent transparent;
    }

    &[data-position='top'] .pxd-popover__content::after,
    &[data-position='bottom'] .pxd-popover__content::after {
      left: 50%;
      transform: translateX(-50%);
    }

    &[data-position='left'] .pxd-popover__content::after,
    &[data-position='right'] .pxd-popover__content::after {
      top: 50%;
      transform: translateY(-50%);
    }

    &[data-position='left-start'] .pxd-popover__content::after,
    &[data-position='right-start'] .pxd-popover__content::after {
      top: 15px;
    }

    &[data-position='left-end'] .pxd-popover__content::after,
    &[data-position='right-end'] .pxd-popover__content::after {
      bottom: 15px;
    }

    &[data-position='top-start'] .pxd-popover__content::after,
    &[data-position='bottom-start'] .pxd-popover__content::after {
      left: 15px;
    }

    &[data-position='top-end'] .pxd-popover__content::after,
    &[data-position='bottom-end'] .pxd-popover__content::after {
      right: 15px;
    }
  }
}

@media (prefers-reduced-motion: no-preference) {

  .showTransition.pxd-transition--popover-top-enter-active,
  .hideTransition.pxd-transition--popover-top-leave-active,
  .showTransition.pxd-transition--popover-bottom-enter-active,
  .hideTransition.pxd-transition--popover-bottom-leave-active,
  .showTransition.pxd-transition--popover-left-enter-active,
  .hideTransition.pxd-transition--popover-left-leave-active,
  .showTransition.pxd-transition--popover-right-enter-active,
  .hideTransition.pxd-transition--popover-right-leave-active {
    transition:
      opacity var(--default-transition-duration) var(--default-transition-timing-function),
      margin var(--default-transition-duration) var(--default-transition-timing-function);
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

  .showTransition.pxd-transition--popover-top-enter-from,
  .hideTransition.pxd-transition--popover-top-leave-to {
    margin-top: calc(1px * var(--translate-offset));
  }

  .showTransition.pxd-transition--popover-bottom-enter-from,
  .hideTransition.pxd-transition--popover-bottom-leave-to {
    margin-top: calc(-1px * var(--translate-offset));
  }

  .showTransition.pxd-transition--popover-left-enter-from,
  .hideTransition.pxd-transition--popover-left-leave-to {
    margin-left: calc(1px * var(--translate-offset));
  }

  .showTransition.pxd-transition--popover-right-enter-from,
  .hideTransition.pxd-transition--popover-right-leave-to {
    margin-left: calc(-1px * var(--translate-offset));
  }
}
</style>
