<script lang="ts" setup>
import { nextTick, shallowRef } from 'vue'
import { useIntersectionObserver } from '../../composables/useBrowserObserver'
import { getCssUnitValue } from '../../utils/format'

interface Props {
  // estimated size
  width?: number | string
  height?: number | string

  // source from: typescript/lib/lib.dom.d.ts
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
    rootMargin: '20%',
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

const isVisible = shallowRef(false)
const containerRef = shallowRef<HTMLElement>()
const containerSize = shallowRef({
  '--width': getCssUnitValue(props.width),
  '--height': getCssUnitValue(props.height),
})

function getRenderedSize() {
  const rect = containerRef.value!.getBoundingClientRect()

  containerSize.value = {
    '--width': `${rect.width}px`,
    '--height': `${rect.height}px`,
  }
}

useIntersectionObserver(containerRef, ([{ isIntersecting }]) => {
  if (isIntersecting && !isVisible.value) {
    isVisible.value = true
    emits('before-show')

    nextTick(() => {
      emits('show')
      getRenderedSize()
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
  <div ref="containerRef" class="pxd-intersection-observer" :style="containerSize">
    <slot v-if="isVisible" />
  </div>
</template>

<style>
.pxd-intersection-observer::before {
  display: block;
  width: var(--width);
  height: var(--height);
  contain: size;
  content-visibility: auto;
  contain-intrinsic-size: var(--width) var(--height);
}

.pxd-intersection-observer:empty::before {
  content: '';
}
</style>
