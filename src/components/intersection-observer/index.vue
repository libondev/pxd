<script lang="ts" setup>
import { nextTick, shallowRef } from 'vue'
import { useIntersectionObserver, useResizeObserver } from '../../composables/useBrowserObserver'

// source from: typescript/lib/lib.dom.d.ts
interface Props {
  root?: Element | Document | null
  rootMargin?: string
  threshold?: number | number[]
}

defineOptions({
  name: 'PIntersectionObserver',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    root: null,
    rootMargin: undefined,
    threshold: 0,
  },
)

const emits = defineEmits<{
  'before-show': []
  'before-hide': []
  'change': [visible: boolean]
  'show': []
  'hide': []
}>()

const isVisible = shallowRef(true)
const containerRef = shallowRef<HTMLElement>()
const containerSize = shallowRef({
  '--width': '0',
  '--height': '0',
})

useResizeObserver(containerRef, ([{ target }]) => {
  const rect = target.getBoundingClientRect()

  containerSize.value = {
    '--width': `${rect.width}px`,
    '--height': `${rect.height}px`,
  }
})

useIntersectionObserver(containerRef, ([{ isIntersecting }]) => {
  if (isIntersecting && !isVisible.value) {
    isVisible.value = true
    emits('before-show')

    nextTick(() => {
      emits('show')
    })
  } else if (!isIntersecting && isVisible.value) {
    isVisible.value = false
    emits('before-hide')

    nextTick(() => {
      emits('hide')
    })
  }

  emits('change', isIntersecting)
}, props)
</script>

<template>
  <div ref="containerRef" class="pxd-intersection-observer">
    <template v-if="isVisible">
      <slot />
    </template>

    <div v-else class="pxd-intersection-observer--placeholder" :style="containerSize" />
  </div>
</template>

<style>
.pxd-intersection-observer--placeholder {
  width: var(--width);
  height: var(--height);
  contain: size;
  content-visibility: auto;
  contain-intrinsic-size: var(--width) var(--height);
}
</style>
