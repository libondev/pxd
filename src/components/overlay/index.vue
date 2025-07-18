<script lang="ts" setup>
import type { ComponentClass } from '../../types/components'
import { computed, nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { getScrollContainer, getScrollElByContainer } from '../../utils/dom'
import { off, on } from '../../utils/events'
import { isServer } from '../../utils/is'
import PTeleport from '../teleport/index.vue'

interface Props {
  blur?: boolean
  zIndex?: number
  modelValue?: boolean
  appendToBody?: boolean
  overlayClass?: ComponentClass
  closeOnPressEscape?: boolean
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

const overlayRef = shallowRef<HTMLElement>()
const computedStyle = computed(() => ({
  '--z': props.zIndex,
}))

function onOverlayClick(ev: MouseEvent) {
  emits('click', ev)
}

function onOverlayKeydown(ev: KeyboardEvent) {
  if (!props.closeOnPressEscape) {
    return
  }

  if (ev.key !== 'Escape') {
    return
  }

  if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
    return
  }

  emits('update:modelValue', false)
}

let scrollContainer: HTMLElement | null

watch(() => props.modelValue, (visible) => {
  if (isServer) {
    return
  }

  if (!visible) {
    if (scrollContainer) {
      scrollContainer.classList.remove('scroll-disabled')
    }

    off(document, 'keydown', onOverlayKeydown)

    return
  }

  nextTick(() => {
    if (!scrollContainer) {
      scrollContainer = getScrollElByContainer(getScrollContainer(overlayRef.value!))
    }

    on(document, 'keydown', onOverlayKeydown)
    scrollContainer.classList.add('scroll-disabled')
  })
}, { immediate: true })

onBeforeUnmount(() => {
  if (!scrollContainer) {
    return
  }

  scrollContainer.classList.remove('scroll-disabled')
  scrollContainer = null
})
</script>

<template>
  <PTeleport :disabled="!appendToBody">
    <Transition name="pxd-transition--fade" mode="out-in">
      <div
        v-if="modelValue"
        ref="overlayRef"
        :data-blur="blur"
        class="pxd-overlay fixed inset-0 bg-black/40 z-[var(--z,10)] sm:bg-background/80 data-[blur=true]:backdrop-blur-xs motion-safe:transition-colors"
        :class="overlayClass"
        :style="computedStyle"
        @click="onOverlayClick"
      />
    </Transition>

    <slot />
  </PTeleport>
</template>
