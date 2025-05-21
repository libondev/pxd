<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useIntersectionObserver } from '../../composables/useIntersectionObserver'
import { getElementRectFromContainer } from '../../utils/dom'
import { off, on } from '../../utils/events'
import { toArray } from '../../utils/format'
import PTeleport from '../teleport/index.vue'

type TriggerType = 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual'

type Position = 'top' | 'bottom' | 'left' | 'right'
  | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
  | 'left-start' | 'left-end' | 'right-start' | 'right-end'

interface Props {
  offset?: number
  content?: string
  visible?: boolean
  trigger?: TriggerType | TriggerType[]
  disabled?: boolean
  maxWidth?: number
  position?: Position
  showDelay?: number
  hideDelay?: number
  showArrow?: boolean
  enterable?: boolean
  arrowColor?: string
  triggerClass?: string
  popoverClass?: string
  popoverStyle?: CSSProperties | string
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
    trigger: 'hover',
    position: 'bottom',
    maxWidth: 300,
    showDelay: 300,
    hideDelay: 300,
    showArrow: true,
    arrowColor: 'var(--color-gray-1000)',
  },
)

const emits = defineEmits<{
  show: []
  hide: []
}>()

let rootRect: DOMRect | null = null
let triggerRect: DOMRect | null = null
let triggerVisible = true

let showPopoverTimer: ReturnType<typeof setTimeout>
let hidePopoverTimer: ReturnType<typeof setTimeout>

const isVisible = shallowRef(props.visible)
const triggerRef = shallowRef<HTMLElement>()
const containerRef = shallowRef<HTMLElement>()
const positionInternal = shallowRef(props.position)
const containerStyle = shallowRef({} as PopoverContainerStyle)

useIntersectionObserver([triggerRef, containerRef], (e) => {
  if (e.target === triggerRef.value) {
    triggerVisible = e.isIntersecting

    return
  }

  if (triggerVisible && e.intersectionRatio < 1) {
    reversePosition()
    updateContentPosition()
  }
}, {
  threshold: [0.5, 1.0],
})

const triggerMethods = computed(() => toArray(props.trigger))

function handlePopoverShow() {
  return new Promise((resolve) => {
    clearTimeout(hidePopoverTimer)
    clearTimeout(showPopoverTimer)

    showPopoverTimer = setTimeout(() => {
      updateContentPosition()
      isVisible.value = true
      resolve(true)
      emits('show')
    }, props.showDelay)
  })
}

function handlePopoverHide() {
  return new Promise((resolve) => {
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

function togglePopover() {
  if (isVisible.value) {
    handlePopoverHide()
  } else {
    handlePopoverShow()
  }
}

function getTriggerRect() {
  rootRect = document.documentElement.getBoundingClientRect()
  triggerRect = triggerRef.value!.getBoundingClientRect()
}

function onTriggerClick() {
  if (props.disabled || !triggerMethods.value.includes('click')) {
    return
  }

  if (isVisible.value) {
    handlePopoverHide().then(() => {
      off(document, 'click', onClickOutsideToHide)
    })

    return
  }

  handlePopoverShow().then(() => {
    on(document, 'click', onClickOutsideToHide)
  })
}

function onTriggerPointerEnter() {
  getTriggerRect()

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

function onTriggerFocusout() {
  if (props.disabled || !triggerMethods.value.includes('focus')) {
    return
  }

  handlePopoverHide()
}

function onTriggerContextmenu(ev: MouseEvent) {
  if (props.disabled || !triggerMethods.value.includes('contextmenu')) {
    return
  }

  ev.preventDefault()

  if (isVisible.value) {
    handlePopoverHide().then(() => {
      off(document, 'click', onClickOutsideToHide)
      off(document, 'contextmenu', onTriggerContextmenu)
    })

    return
  }

  handlePopoverShow().then(() => {
    on(document, 'click', onClickOutsideToHide)
    on(document, 'contextmenu', onTriggerContextmenu)
  })
}

function onClickOutsideToHide(ev: MouseEvent) {
  const target = ev.target as HTMLElement

  if (!triggerRef.value?.contains(target) && !containerRef.value?.contains(target)) {
    handlePopoverHide()
  }
}

function onContentPointerEnter() {
  if (props.disabled || !triggerMethods.value.includes('hover')) {
    return
  }

  if (props.enterable) {
    handlePopoverShow()
  }
}

function onContentPointerLeave() {
  if (props.disabled || !triggerMethods.value.includes('hover')) {
    return
  }

  if (props.enterable) {
    handlePopoverHide()
  }
}

function updateContentPosition() {
  const position = positionInternal.value
  const { offset, arrowColor, maxWidth } = props
  const { scrollLeft, scrollTop, width, height } = getElementRectFromContainer(triggerRect!, rootRect!)

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
function reversePosition() {
  if (positionInternal.value.startsWith('top')) {
    positionInternal.value = positionInternal.value.replace('top', 'bottom') as Position
  } else if (positionInternal.value.startsWith('bottom')) {
    positionInternal.value = positionInternal.value.replace('bottom', 'top') as Position
  } else if (positionInternal.value.startsWith('left')) {
    positionInternal.value = positionInternal.value.replace('left', 'right') as Position
  } else if (positionInternal.value.startsWith('right')) {
    positionInternal.value = positionInternal.value.replace('right', 'left') as Position
  }
}

watch(
  () => props.visible,
  (visible) => {
    isVisible.value = visible
    togglePopover()
  },
)

onBeforeUnmount(() => {
  off(document, 'click', onClickOutsideToHide)
  off(document, 'contextmenu', onTriggerContextmenu)
  clearTimeout(showPopoverTimer)
  clearTimeout(hidePopoverTimer)
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
      @click="onTriggerClick"
      @pointerenter="onTriggerPointerEnter"
      @pointerleave="onTriggerPointerLeave"
      @focusin="onTriggerFocusin"
      @focusout="onTriggerFocusout"
      @contextmenu="onTriggerContextmenu"
    >
      <slot />
    </div>

    <PTeleport>
      <Transition name="pxd-transition--fade">
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
</style>
