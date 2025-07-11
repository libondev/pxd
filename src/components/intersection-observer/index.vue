<script lang="ts" setup>
import { nextTick, shallowRef } from 'vue'
import { useIntersectionObserver } from '../../composables/useBrowserObserver'
import { getCssUnitValue } from '../../utils/format'
import KeepAliveContent from './content.vue'

interface Props {
  // estimated size
  width?: number | string
  height?: number | string
  keepAlive?: boolean

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

function getRenderedSlotSize() {
  const rect = containerRef.value!.getBoundingClientRect()

  containerSize.value = {
    '--width': `${rect.width}px`,
    '--height': `${rect.height}px`,
  }
}

function onVisibleChange(isIntersecting: boolean) {
  if (isIntersecting && !isVisible.value) {
    isVisible.value = true
    emits('before-show')

    nextTick(() => {
      emits('show')
    })
  } else if (!isIntersecting && isVisible.value) {
    isVisible.value = false
    emits('before-hide')
    getRenderedSlotSize()

    nextTick(() => {
      emits('hide')
    })
  }

  emits('change', isIntersecting)
}

useIntersectionObserver(containerRef, ([{ isIntersecting }]) => {
  onVisibleChange(isIntersecting)
}, props)
</script>

<template>
  <div ref="containerRef" class="pxd-intersection-observer" :style="containerSize">
    <KeepAlive v-if="keepAlive">
      <KeepAliveContent v-if="isVisible">
        <slot />
      </KeepAliveContent>
    </KeepAlive>
    <template v-else>
      <slot v-if="isVisible" />
    </template>
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
