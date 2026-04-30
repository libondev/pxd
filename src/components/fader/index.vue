<script lang="ts" setup>
import type { MaybeElementRef } from '../../types/shared/utils'
import type { FaderProps } from './types'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { cachedOff, cachedOn } from '../../utils/event'
import { getCssUnitValue } from '../../utils/format'
import { unrefElement } from '../../utils/ref'
import { throttleByRaf } from '../../utils/timing'

defineOptions({
  name: 'PFader',
  inheritAttrs: false,
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
const DIFF_THRESHOLD = 16

const computedStyle = computed(() => ({
  '--fader-color': props.color,
  '--fader-size': getCssUnitValue(props.size),
}))

const formattedContainer = computed(() => {
  const { container } = props

  if (typeof container === 'string') {
    return document.querySelector<HTMLElement>(container)
  } else {
    return unrefElement(container as MaybeElementRef<HTMLElement>)
  }
})

const onContainerScroll = throttleByRaf(() => {
  const container = formattedContainer.value

  if (!container || !container.isConnected) {
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

    cachedOn(container, 'scroll', onContainerScroll, { passive: true })
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
    v-bind="$attrs"
  >
    <div
      v-if="['both', 'horizontal'].includes(direction)"
      class="pxd-fader--item horizontal inset-0 absolute rounded-inherit before:default-transition-duration before:default-transition-timing-function after:default-transition-duration after:default-transition-timing-function"
      :class="{ left: fader.left, right: fader.right }"
    />
    <div
      v-if="['both', 'vertical'].includes(direction)"
      class="pxd-fader--item vertical inset-0 absolute rounded-inherit before:default-transition-duration before:default-transition-timing-function after:default-transition-duration after:default-transition-timing-function"
      :class="{ top: fader.top, bottom: fader.bottom }"
    />
  </div>
</template>

<style lang="postcss">
.pxd-fader--item::before,
.pxd-fader--item::after {
  content: '';
  position: absolute;
  border-radius: inherit;
  background: linear-gradient(var(--dir), transparent, var(--fader-color));
  mask-image: linear-gradient(var(--dir-revert), var(--fader-color) 50%, transparent);
  transition-property: opacity;
  opacity: 0;
}

.pxd-fader--item.left::before,
.pxd-fader--item.top::before,
.pxd-fader--item.right::after,
.pxd-fader--item.bottom::after {
  opacity: 1;
}

.pxd-fader--item.horizontal {
  &::before,
  &::after {
    top: 0;
    width: var(--fader-size);
    height: 100%;
  }

  &::before {
    left: 0;
    --dir: to left;
    --dir-revert: to right;
  }

  &::after {
    right: 0;
    --dir: to right;
    --dir-revert: to left;
  }
}

.pxd-fader--item.vertical {
  &::before,
  &::after {
    left: 0;
    width: 100%;
    height: var(--fader-size);
  }

  &::before {
    top: 0;
    --dir: to top;
    --dir-revert: to bottom;
  }

  &::after {
    bottom: 0;
    --dir: to bottom;
    --dir-revert: to top;
  }
}
</style>
