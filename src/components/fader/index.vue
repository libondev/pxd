<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { cachedOff, cachedOn } from '../../utils/event'
import { getCssUnitValue } from '../../utils/format'
import { unrefElement } from '../../utils/ref'
import { throttleByRaf } from '../../utils/throttle'
import type { FaderProps } from './types'

defineOptions({
  name: 'PFader',
})

const props = withDefaults(defineProps<FaderProps>(), {
  direction: 'both',
})

const fader = shallowRef({
  top: false,
  left: false,
  right: false,
  bottom: false,
})

const DEFAULT_SIZE = 16
const DIFF_THRESHOLD = 1

const computedStyle = computed(() => ({
  '--fader-color': props.color,
  '--fader-size': getCssUnitValue(props.size),
}))

const formattedContainer = computed(() => {
  const { container } = props

  if (typeof container === 'string') {
    return document.querySelector<HTMLElement>(container)
  } else {
    return unrefElement(container)
  }
})

const onContainerScroll = throttleByRaf(() => {
  const container = formattedContainer.value

  if (!container) {
    return
  }

  const { size = DEFAULT_SIZE } = props
  const { scrollLeft, scrollWidth, clientWidth, scrollTop, clientHeight, scrollHeight } = container

  fader.value = {
    left: scrollLeft >= size,
    right: scrollLeft + clientWidth < scrollWidth - DIFF_THRESHOLD,
    top: scrollTop >= size,
    bottom: scrollTop + clientHeight < scrollHeight - DIFF_THRESHOLD,
  }
})

useResizeObserver(() => formattedContainer.value, onContainerScroll)

watch(
  () => formattedContainer.value,
  (container, oldDom) => {
    if (oldDom) {
      cachedOff(oldDom, 'scroll', onContainerScroll)

      return
    }

    if (!container) {
      return
    }

    cachedOn(container, 'scroll', onContainerScroll)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  cachedOff(formattedContainer.value, 'scroll', onContainerScroll)
})
</script>

<template>
  <div
    aria-hidden="true"
    class="pxd-fader inset-0 pointer-events-none absolute size-full rounded-inherit"
    :style="computedStyle"
  >
    <div
      v-if="['both', 'horizontal'].includes(direction)"
      class="pxd-fader--item horizontal inset-0 absolute rounded-inherit before:default-transition-duration before:default-transition-timing-function"
      :class="{ left: fader.left, right: fader.right }"
    />
    <div
      v-if="['both', 'vertical'].includes(direction)"
      class="pxd-fader--item vertical inset-0 absolute rounded-inherit before:default-transition-duration before:default-transition-timing-function"
      :class="{ top: fader.top, bottom: fader.bottom }"
    />
  </div>
</template>

<style lang="postcss">
.pxd-fader--item::before {
  content: '';
  position: absolute;
  border-radius: inherit;
  background: linear-gradient(var(--dir), transparent, var(--fader-color, var(--color-gray-100)));
  mask-image: linear-gradient(
    var(--dir-revert),
    var(--fader-color, var(--color-gray-100)) 50%,
    transparent
  );
  transition-property: opacity;
  opacity: 0;
}

.pxd-fader--item.left::before,
.pxd-fader--item.top::before {
  opacity: 1;
}

.pxd-fader--item.horizontal {
  &::before {
    top: 0;
    width: var(--fader-size, 16px);
    height: 100%;
  }

  &::before {
    left: 0;
    --dir: to left;
    --dir-revert: to right;
  }
}

.pxd-fader--item.vertical {
  &::before {
    left: 0;
    width: 100%;
    height: var(--fader-size, 16px);
  }

  &::before {
    top: 0;
    --dir: to top;
    --dir-revert: to bottom;
  }
}
</style>
