<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { PopoverBasePosition, PopoverPosition, PopoverTrigger } from '../../types/components'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { getElementRectFromContainer } from '../../utils/dom'
import { off, on } from '../../utils/events'
import { toArray } from '../../utils/format'
import PTeleport from '../teleport/index.vue'

interface Props {
  offset?: number
  content?: string
  visible?: boolean
  trigger?: PopoverTrigger | PopoverTrigger[]
  disabled?: boolean
  maxWidth?: number
  position?: PopoverPosition
  showDelay?: number
  hideDelay?: number
  showArrow?: boolean
  enterable?: boolean
  arrowColor?: string
  triggerClass?: string
  popoverClass?: string
  // autoPosition?: boolean
  popoverStyle?: CSSProperties | string
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
    offset: 10,
    trigger: () => ['hover'],
    position: 'bottom',
    maxWidth: 300,
    showDelay: 300,
    hideDelay: 300,
    showArrow: true,
    arrowColor: 'var(--color-gray-1000)',
    translateOffset: 3,
    // autoPosition: true,
  },
)

const emits = defineEmits<{
  show: []
  hide: []
}>()

let triggerRect: DOMRect | null = null
let viewportRect: DOMRect | null = null
// let scrollContainer: ReturnType<typeof getScrollContainer>

let showPopoverTimer: ReturnType<typeof setTimeout>
let hidePopoverTimer: ReturnType<typeof setTimeout>

const isVisible = shallowRef(props.visible)
const triggerRef = shallowRef<HTMLElement>()
const containerRef = shallowRef<HTMLElement>()
const positionInternal = shallowRef(props.position)
const containerStyle = shallowRef({} as PopoverContainerStyle)

const triggerMethods = computed<PopoverTrigger[]>(() => toArray(props.trigger))
const generalPosition = computed(() => positionInternal.value.split('-')[0] as PopoverBasePosition)
const transitionName = computed(() => `pxd-transition--popover-${generalPosition.value}`)

// 判断 containerRef 的元素在渲染后是否超出了屏幕之外
// function isContainerOverlapping(
//   containerRect: DOMRect,
//   viewportRect: DOMRect,
//   scrollInfo: ReturnType<typeof getScrollPositions>,
// ) {
//   const containerTop = containerRect.top - scrollInfo.scrollTop
//   const containerBottom = containerRect.bottom - scrollInfo.scrollTop
//   const containerLeft = containerRect.left - scrollInfo.scrollLeft
//   const containerRight = containerRect.right - scrollInfo.scrollLeft

//   const isTopOverlapping = containerTop < viewportRect.top
//   const isBottomOverlapping = containerBottom > viewportRect.bottom
//   const isLeftOverlapping = containerLeft < viewportRect.left
//   const isRightOverlapping = containerRight > viewportRect.right

//   return {
//     isOverlapping: isTopOverlapping || isBottomOverlapping || isLeftOverlapping || isRightOverlapping,
//     top: isTopOverlapping,
//     bottom: isBottomOverlapping,
//     left: isLeftOverlapping,
//     right: isRightOverlapping,
//   }
// }

function getTriggerRect() {
  triggerRect = triggerRef.value!.getBoundingClientRect()
  viewportRect = document.documentElement.getBoundingClientRect()
}

async function handlePopoverShow() {
  await new Promise((resolve) => {
    getTriggerRect()
    clearTimeout(hidePopoverTimer)
    clearTimeout(showPopoverTimer)

    showPopoverTimer = setTimeout(() => {
      updateContentPosition()
      isVisible.value = true
      resolve(true)
      emits('show')
    }, props.showDelay)
  })

  // if (props.autoPosition) {
  //   // 渲染以后判断初始是否被遮挡, 如果被遮挡则调换位置
  //   const scrollInfo = getScrollPositions(scrollContainer)
  //   const containerRect = containerRef.value!.getBoundingClientRect()
  //   const overlapping = isContainerOverlapping(containerRect, viewportRect!, scrollInfo)

  //   if (overlapping.isOverlapping && overlapping[generalPosition.value]) {
  //     reversePosition()
  //     updateContentPosition()
  //   }
  // }
}

async function handlePopoverHide() {
  await new Promise((resolve) => {
    clearTimeout(showPopoverTimer)
    clearTimeout(hidePopoverTimer)

    hidePopoverTimer = setTimeout(() => {
      isVisible.value = false
      resolve(true)
      emits('hide')

      // 关闭时重置方向，避免下次打开时方向不正确
      positionInternal.value = props.position
    }, props.hideDelay)
  })
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

  if (props.enterable) {
    handlePopoverShow()
  }
}

function onContentPointerLeave() {
  if (props.disabled) {
    return
  }

  if (props.enterable) {
    handlePopoverHide()
  }
}

function updateContentPosition() {
  const position = positionInternal.value
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
    'max-width': `${maxWidth}px`,
    '--offset': `${offset}px`,
    '--arrow-color': arrowColor,
  }
}

// 当屏幕可用空间不足时反转方向
// function reversePosition() {
//   if (positionInternal.value.startsWith('top')) {
//     positionInternal.value = positionInternal.value.replace('top', 'bottom') as PopoverPosition
//   } else if (positionInternal.value.startsWith('bottom')) {
//     positionInternal.value = positionInternal.value.replace('bottom', 'top') as PopoverPosition
//   } else if (positionInternal.value.startsWith('left')) {
//     positionInternal.value = positionInternal.value.replace('left', 'right') as PopoverPosition
//   } else if (positionInternal.value.startsWith('right')) {
//     positionInternal.value = positionInternal.value.replace('right', 'left') as PopoverPosition
//   }
// }

// const onParentsScroll = throttle(() => {
//   if (!isVisible.value) {
//     return
//   }

//   const scrollInfo = getScrollPositions(scrollContainer)
//   const containerRect = containerRef.value!.getBoundingClientRect()
//   const overlapping = isContainerOverlapping(containerRect, viewportRect!, scrollInfo)

//   if (overlapping.isOverlapping && overlapping[generalPosition.value]) {
//     reversePosition()
//     updateContentPosition()
//   } else if (!overlapping.isOverlapping) {
//     positionInternal.value = props.position
//     updateContentPosition()
//   }
// }, 500)

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

watch<[HTMLElement | undefined, PopoverTrigger[]]>(
  () => [triggerRef.value, triggerMethods.value],
  ([newDom, newMethods], [oldDom, oldMethods]) => {
    // unbind old trigger methods events
    if (oldDom) {
      for (const method of oldMethods) {
        const events = triggerMethodEvents[method as keyof typeof triggerMethodEvents]

        if (!events) {
          continue
        }

        for (const event of events) {
          off(oldDom, event[0], event[1])
        }
      }
    }

    if (newDom) {
      for (const method of newMethods) {
        const events = triggerMethodEvents[method as keyof typeof triggerMethodEvents]

        if (!events) {
          continue
        }

        for (const event of events) {
          on(newDom, event[0], event[1])
        }
      }
    }
  },
)

// onMounted(() => {
//   if (!isClient) {
//     return
//   }

//   if (props.autoPosition) {
//     scrollContainer = getScrollContainer(triggerRef.value!, true)
//     on(scrollContainer, 'scroll', onParentsScroll, { passive: true })
//   }
// })

onBeforeUnmount(() => {
  triggerRect = null
  viewportRect = null

  clearTimeout(showPopoverTimer)
  clearTimeout(hidePopoverTimer)
  off(document, 'click', onClickOutsideToHide)
  off(document, 'contextmenu', onTriggerContextmenu)
  // off(scrollContainer, 'scroll', onParentsScroll)
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
      class="pxd-popover__trigger"
      :class="triggerClass"
    >
      <slot />
    </div>

    <PTeleport>
      <Transition :name="transitionName" mode="out-in" :style="{ '--translate-offset': translateOffset }">
        <div
          v-if="isVisible"
          ref="containerRef"
          :style="containerStyle"
          :data-position="positionInternal"
          class="pxd-popover__container isolate absolute z-10"
          :class="[{ 'pointer-events-none': !enterable, 'show-arrow': showArrow }]"
          @pointerenter="onContentPointerEnter"
          @pointerleave="onContentPointerLeave"
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
  top: -100%;
  left: -100%;

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
  .pxd-transition--popover-top-enter-active,
  .pxd-transition--popover-top-leave-active,
  .pxd-transition--popover-bottom-enter-active,
  .pxd-transition--popover-bottom-leave-active,
  .pxd-transition--popover-left-enter-active,
  .pxd-transition--popover-left-leave-active,
  .pxd-transition--popover-right-enter-active,
  .pxd-transition--popover-right-leave-active {
    transition: opacity 0.2s ease-in-out, margin 0.2s ease-in-out;
  }

  .pxd-transition--popover-top-enter-from,
  .pxd-transition--popover-top-leave-to,
  .pxd-transition--popover-bottom-enter-from,
  .pxd-transition--popover-bottom-leave-to,
  .pxd-transition--popover-left-enter-from,
  .pxd-transition--popover-left-leave-to,
  .pxd-transition--popover-right-enter-from,
  .pxd-transition--popover-right-leave-to  {
    opacity: 0;
  }

  .pxd-transition--popover-top-enter-from,
  .pxd-transition--popover-top-leave-to {
    margin-top: calc(1px * var(--translate-offset));
  }

  .pxd-transition--popover-bottom-enter-from,
  .pxd-transition--popover-bottom-leave-to {
    margin-top: calc(-1px * var(--translate-offset));
  }

  .pxd-transition--popover-left-enter-from,
  .pxd-transition--popover-left-leave-to {
    margin-left: calc(1px * var(--translate-offset));
  }

  .pxd-transition--popover-right-enter-from,
  .pxd-transition--popover-right-leave-to {
    margin-left: calc(-1px * var(--translate-offset));
  }
}
</style>
