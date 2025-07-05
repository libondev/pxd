<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { getScrollContainer } from '../../utils/dom'
import PTeleport from '../teleport/index.vue'

interface Props {
  zIndex?: number
  modelValue?: boolean
  appendToBody?: boolean
  overlayClass?: string
}

defineOptions({
  name: 'POverlay',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: false,
    appendToBody: true,
  },
)

const emits = defineEmits<{
  click: [MouseEvent]
}>()

const overlayRef = shallowRef<HTMLElement>()
const computedStyle = computed(() => {
  return {
    '--z': props.zIndex,
  }
})

function onOverlayClick(ev: MouseEvent) {
  emits('click', ev)
}

let scrollContainer: HTMLElement

watch(() => props.modelValue, (visible) => {
  if (!visible) {
    if (scrollContainer) {
      scrollContainer.classList.remove('scroll-disabled')
    }

    return
  }

  nextTick(() => {
    if (!scrollContainer) {
      const container = getScrollContainer(overlayRef.value!)
      scrollContainer = container === window ? document.documentElement : container as HTMLElement
    }

    scrollContainer.classList.add('scroll-disabled')
  })
}, { immediate: true })

onBeforeUnmount(() => {
  if (scrollContainer) {
    scrollContainer.classList.remove('scroll-disabled')
  }
})
</script>

<template>
  <PTeleport :disabled="!appendToBody">
    <Transition name="pxd-transition--fade" mode="out-in">
      <div
        v-if="modelValue"
        ref="overlayRef"
        tabindex="-1"
        class="pxd-overlay fixed inset-0 bg-black/40 sm:bg-background/80 motion-safe:transition-colors"
        :class="overlayClass"
        :style="computedStyle"
        @click="onOverlayClick"
      />
    </Transition>

    <slot />
  </PTeleport>
</template>

<style>
.pxd-overlay {
  z-index: var(--z, 10);
}
</style>
