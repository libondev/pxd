<script lang="ts" setup>
import { nextTick, shallowRef } from 'vue'
import { useIntersectionObserver } from '../../composables/use-browser-observer'
import { getCssUnitValue } from '../../utils/format'
import FragmentContainer from '../_internal/fragment-container.vue'
import type { IntersectionObserverEmits, IntersectionObserverProps } from './types'

defineOptions({
  name: 'PIntersectionObserver',
})

const props = withDefaults(defineProps<IntersectionObserverProps>(), {
  root: null,
  rootMargin: '20%',
  threshold: 0,
})

const emits = defineEmits<IntersectionObserverEmits>()

const isVisible = shallowRef(false)
const containerRef = shallowRef<HTMLElement>()
const containerSize = shallowRef({
  '--slot-estimated-width': getCssUnitValue(props.width),
  '--slot-estimated-height': getCssUnitValue(props.height),
})

function getRenderedSlotSize() {
  const rect = containerRef.value!.getBoundingClientRect()

  containerSize.value = {
    '--slot-estimated-width': `${rect.width}px`,
    '--slot-estimated-height': `${rect.height}px`,
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

  emits('visible-change', isIntersecting)
}

useIntersectionObserver(
  containerRef,
  ([entry]) => {
    onVisibleChange(entry!.isIntersecting)
  },
  props,
)
</script>

<template>
  <div ref="containerRef" class="pxd-intersection-observer" :style="containerSize">
    <KeepAlive v-if="keepAlive">
      <FragmentContainer v-if="isVisible">
        <slot />
      </FragmentContainer>
    </KeepAlive>
    <template v-else>
      <slot v-if="isVisible" />
    </template>
  </div>
</template>

<style>
.pxd-intersection-observer::before {
  display: block;
  width: var(--slot-estimated-width);
  height: var(--slot-estimated-height);
  contain: size;
  content-visibility: auto;
  contain-intrinsic-size: var(--slot-estimated-width) var(--slot-estimated-height);
}

.pxd-intersection-observer:empty::before {
  content: '';
}
</style>
