<script lang="ts" setup>
import type { FaderProps } from './types'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useMutationObserver } from '../../composables/use-mutation-observer.js'
import { useResizeObserver } from '../../composables/use-resize-observer.js'
import { getElement } from '../../utils/dom.js'
import { cachedOff, cachedOn, throttleByRaf } from '../../utils/event.js'
import { getCssUnitValue } from '../../utils/format.js'

defineOptions({
  name: 'PFader',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FaderProps>(), {
  direction: 'both',
  size: 16,
  threshold: 16,
})

const showTop = shallowRef(false)
const showLeft = shallowRef(false)
const showRight = shallowRef(false)
const showBottom = shallowRef(false)
const observedContent = shallowRef<HTMLElement[]>([])

const computedStyle = computed(() => ({
  '--fader-color': props.color,
  '--fader-size': getCssUnitValue(props.size),
}))

const formattedContainer = computed(() => getElement(props.scrollTarget))

const updateFaders = throttleByRaf(() => {
  const container = formattedContainer.value

  if (!container || !container.isConnected) {
    return
  }

  const { size, threshold } = props
  const { scrollLeft, scrollWidth, clientWidth, scrollTop, clientHeight, scrollHeight } = container

  showLeft.value = scrollLeft >= size
  showRight.value = scrollLeft + clientWidth < scrollWidth - threshold
  showTop.value = scrollTop >= size
  showBottom.value = scrollTop + clientHeight < scrollHeight - threshold
})

useResizeObserver(() => {
  const container = formattedContainer.value
  return container ? [container, ...observedContent.value] : []
}, updateFaders)

useMutationObserver(
  () => formattedContainer.value,
  (items) => {
    if (items.some((item) => item.entry.type === 'childList')) {
      syncObservedContent()
    }

    updateFaders()
  },
  { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] },
)

function syncObservedContent() {
  const container = formattedContainer.value
  const next = container ? (Array.from(container.children) as HTMLElement[]) : []
  const prev = observedContent.value

  if (prev.length === next.length && prev.every((el, i) => el === next[i])) {
    return
  }

  observedContent.value = next
}

watch(
  () => formattedContainer.value,
  (container, oldDom) => {
    if (oldDom) {
      cachedOff(oldDom, 'scroll', updateFaders)
    }

    if (!container) {
      return
    }

    cachedOn(container, 'scroll', updateFaders, { passive: true })
    syncObservedContent()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  updateFaders.cancel()
  cachedOff(formattedContainer.value, 'scroll', updateFaders)
})
</script>

<template>
  <div
    data-fader
    aria-hidden="true"
    class="pxd-fader inset-0 pointer-events-none absolute size-full rounded-inherit"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <div
      v-if="direction !== 'vertical'"
      class="pxd-fader--item horizontal inset-0 absolute rounded-inherit before:default-transition-duration before:default-transition-timing-function after:default-transition-duration after:default-transition-timing-function"
      :class="{ left: showLeft, right: showRight }"
    />
    <div
      v-if="direction !== 'horizontal'"
      class="pxd-fader--item vertical inset-0 absolute rounded-inherit before:default-transition-duration before:default-transition-timing-function after:default-transition-duration after:default-transition-timing-function"
      :class="{ top: showTop, bottom: showBottom }"
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
