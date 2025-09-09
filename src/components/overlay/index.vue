<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
} from 'vue'
import {
  getScrollContainer,
  getScrollElByContainer,
  hasScrollbar,
  isScrollable,
} from '../../utils/dom'
import { optimizedOff, optimizedOn, preventDefault } from '../../utils/event'
import { isTruthyProp } from '../../utils/format'
import { isIOS, isServer } from '../../utils/is'
import { unrefElement } from '../../utils/ref'
import PTeleport from '../teleport/index.vue'

interface Props {
  blur?: boolean
  zIndex?: number
  modelValue?: boolean
  appendToBody?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
  shownElement?: string | HTMLElement
}

defineOptions({
  name: 'POverlay',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  appendToBody: true,
  closeOnPressEscape: true,
})

const emits = defineEmits<{
  'click': [MouseEvent]
  'update:modelValue': [boolean]
}>()

let scrollContainer: HTMLElement | null

const clipPath = ref('')
const overlayRef = shallowRef<HTMLElement>()
const computedStyle = computed(() => ({
  '--z': props.zIndex,
  'clip-path': clipPath.value,
}))

function onOverlayClick(ev: MouseEvent) {
  emits('click', ev)

  if (!isTruthyProp(props.closeOnClickOverlay)) {
    return
  }

  emits('update:modelValue', false)
}

function onOverlayKeydown(ev: KeyboardEvent) {
  if (!isTruthyProp(props.closeOnPressEscape) || !props.modelValue) {
    return
  }

  if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
    return
  }

  if (ev.key !== 'Escape') {
    return
  }

  emits('update:modelValue', false)
}

function addScrollDisabled() {
  if (!scrollContainer) {
    return
  }

  const { x: xScrollbar, y: yScrollbar } = hasScrollbar(scrollContainer)
  const { x: xScrollable, y: yScrollable } = isScrollable(scrollContainer)

  document.body.classList.add('pointer-events-none')

  if (xScrollbar && xScrollable) {
    scrollContainer.classList.add('scrollbar-stable', 'scroll-disabled-x')
  }

  if (yScrollbar && yScrollable) {
    scrollContainer.classList.add('scrollbar-stable', 'scroll-disabled-y')
  }

  if (isIOS) {
    optimizedOn(document, 'touchmove', preventDefault, { passive: false })
  }
}

function removeScrollDisabled() {
  if (!scrollContainer) {
    return
  }

  document.body.classList.remove('pointer-events-none')
  scrollContainer.classList.remove(
    'pointer-events-none',
    'scroll-disabled-x',
    'scroll-disabled-y',
    'scrollbar-stable',
  )

  if (isIOS) {
    optimizedOff(document, 'touchmove', preventDefault)
  }
}

function tryGetShownElementIfNeed() {
  const { shownElement } = props

  if (!shownElement) {
    return
  }

  const el = typeof shownElement === 'string'
    ? document.querySelector<HTMLElement>(shownElement)
    : unrefElement(shownElement)

  if (!el) {
    return
  }

  el.classList.add('pointer-events-auto')
  const { top, left, right, bottom } = el.getBoundingClientRect()

  clipPath.value = `polygon(
    0% 0%,
    0% 100%,
    ${left}px 100%,
    ${left}px ${top}px,
    ${right}px ${top}px,
    ${right}px ${bottom}px,
    ${left}px ${bottom}px,
    ${left}px 100%,
    100% 100%,
    100% 0%
  )`
}

watch(
  () => props.shownElement,
  tryGetShownElementIfNeed,
)

watch(
  () => props.modelValue,
  (visible) => {
    if (isServer) {
      return
    }

    if (!visible) {
      removeScrollDisabled()
      optimizedOff(document, 'keydown', onOverlayKeydown)

      return
    }

    nextTick(() => {
      if (!scrollContainer) {
        scrollContainer = getScrollElByContainer(
          getScrollContainer(overlayRef.value!, true),
        )
      }

      addScrollDisabled()
      tryGetShownElementIfNeed()
      optimizedOn(document, 'keydown', onOverlayKeydown)
    })
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  optimizedOff(document, 'keydown', onOverlayKeydown)

  removeScrollDisabled()
  scrollContainer = null
})
</script>

<template>
  <PTeleport :disabled="!appendToBody">
    <Transition name="pxd-transition--fade" mode="out-in" appear>
      <div
        v-if="modelValue"
        ref="overlayRef"
        :data-blur="blur"
        class="pxd-overlay inset-0 bg-black/40 sm:bg-background-100/80 pointer-events-auto fixed z-(--z,10) data-[blur=true]:backdrop-blur-xs motion-safe:transition-colors"
        :style="computedStyle"
        v-bind="$attrs"
        @click="onOverlayClick"
      />
    </Transition>

    <slot />
  </PTeleport>
</template>
