<script lang="ts" setup>
import type { IntersectionObserverEmits, IntersectionObserverProps } from './types'
import { nextTick, shallowRef } from 'vue'
import { useIntersectionObserver } from '../../composables/use-browser-observer'
import { getCssUnitValue } from '../../utils/format'
import FragmentContainer from '../_internal/fragment-container.vue'

defineOptions({
  name: 'PIntersectionObserver',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<IntersectionObserverProps>(), {
  rootMargin: '20%',
  threshold: 0,
})

const emits = defineEmits<IntersectionObserverEmits>()

const isVisible = shallowRef(false)
const containerRef = shallowRef<HTMLElement>()
const containerSize = shallowRef({
  'contain-intrinsic-size': `auto ${getCssUnitValue(props.height)}`,
  '--slot-estimated-width': getCssUnitValue(props.width),
  '--slot-estimated-height': getCssUnitValue(props.height),
})

function getRenderedSlotSize() {
  const { offsetWidth, offsetHeight } = containerRef.value!

  containerSize.value = {
    'contain-intrinsic-size': `auto ${offsetHeight}px`,
    '--slot-estimated-width': `${offsetWidth}px`,
    '--slot-estimated-height': `${offsetHeight}px`,
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
  <div
    ref="containerRef"
    class="pxd-intersection-observer content-visibility-auto"
    :style="containerSize"
    v-bind="$attrs"
  >
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
