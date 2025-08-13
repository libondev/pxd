<script lang="ts" setup>
import type { ComponentClass } from '../../types/shared'
import { computed, nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { getScrollContainer, getScrollElByContainer, hasScrollbar, isScrollable } from '../../utils/dom'
import { optimizedOff, optimizedOn } from '../../utils/events'
import { isServer } from '../../utils/is'
import PTeleport from '../teleport/index.vue'

interface Props {
  blur?: boolean
  zIndex?: number
  modelValue?: boolean
  appendToBody?: boolean
  overlayClass?: ComponentClass
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
}

defineOptions({
  name: 'POverlay',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: false,
    appendToBody: true,
    closeOnPressEscape: true,
  },
)

const emits = defineEmits<{
  'click': [MouseEvent]
  'update:modelValue': [boolean]
}>()

let scrollContainer: HTMLElement | null

const overlayRef = shallowRef<HTMLElement>()
const computedStyle = computed(() => ({
  '--z': props.zIndex,
}))

function onOverlayClick(ev: MouseEvent) {
  emits('click', ev)

  if (!props.closeOnClickOverlay) {
    return
  }

  emits('update:modelValue', false)
}

function onOverlayKeydown(ev: KeyboardEvent) {
  if (!props.closeOnPressEscape || !props.modelValue) {
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

  if (xScrollbar && xScrollable) {
    scrollContainer.classList.add('scrollbar-stable', 'scroll-disabled-x')
  }

  if (yScrollbar && yScrollable) {
    scrollContainer.classList.add('scrollbar-stable', 'scroll-disabled-y')
  }
}

function removeScrollDisabled() {
  if (!scrollContainer) {
    return
  }

  scrollContainer.classList.remove('scroll-disabled-x', 'scroll-disabled-y', 'scrollbar-stable')
}

watch(() => props.modelValue, (visible) => {
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
    optimizedOn(document, 'keydown', onOverlayKeydown)
  })
}, { immediate: true })

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
        class="pxd-overlay inset-0 bg-black/40 sm:bg-background-100/80 fixed z-(--z,10) data-[blur=true]:backdrop-blur-xs motion-safe:transition-colors"
        :class="overlayClass"
        :style="computedStyle"
        @click="onOverlayClick"
      />
    </Transition>

    <slot />
  </PTeleport>
</template>
