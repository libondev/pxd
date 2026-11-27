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
  threshold: 16,
  dimension: 24,
})

const FADER_ITEM_BASE =
  'inset-0 absolute rounded-inherit before:default-transition-duration before:default-transition-timing-function after:default-transition-duration after:default-transition-timing-function'

const showTop = shallowRef(false)
const showLeft = shallowRef(false)
const showRight = shallowRef(false)
const showBottom = shallowRef(false)
const observedContent = shallowRef<HTMLElement[]>([])

const computedStyle = computed(() => ({
  '--fader-color': props.color,
  '--fader-dimension': getCssUnitValue(props.dimension),
}))

const formattedContainer = computed(() => getElement(props.scrollTarget))

const updateFaders = throttleByRaf(() => {
  const container = formattedContainer.value

  if (!container || !container.isConnected) {
    return
  }

  const { dimension, threshold } = props
  const { scrollLeft, scrollWidth, clientWidth, scrollTop, clientHeight, scrollHeight } = container

  showLeft.value = scrollLeft >= dimension
  showRight.value = scrollLeft + clientWidth < scrollWidth - threshold
  showTop.value = scrollTop >= dimension
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
      class="pxd-fader--item horizontal"
      :class="[FADER_ITEM_BASE, { left: showLeft, right: showRight }]"
    />
    <div
      v-if="direction !== 'horizontal'"
      class="pxd-fader--item vertical"
      :class="[FADER_ITEM_BASE, { top: showTop, bottom: showBottom }]"
    />
  </div>
</template>

<style lang="postcss">
.pxd-fader {
  --fader-feather: calc(var(--fader-dimension, 1.5rem) * 0.5);
}

.pxd-fader--item::before,
.pxd-fader--item::after {
  content: '';
  position: absolute;
  border-radius: inherit;
  background: var(--fader-color, var(--color-background-100));
  mask-image: linear-gradient(
    var(--dir),
    black,
    rgb(0 0 0 / 84%) 25%,
    rgb(0 0 0 / 50%) 50%,
    rgb(0 0 0 / 16%) 75%,
    transparent
  );
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
  mask-image: linear-gradient(
    to bottom,
    transparent,
    rgb(0 0 0 / 16%) calc(var(--fader-feather) * 0.25),
    rgb(0 0 0 / 50%) calc(var(--fader-feather) * 0.5),
    rgb(0 0 0 / 84%) calc(var(--fader-feather) * 0.75),
    black var(--fader-feather),
    black calc(100% - var(--fader-feather)),
    rgb(0 0 0 / 84%) calc(100% - var(--fader-feather) * 0.75),
    rgb(0 0 0 / 50%) calc(100% - var(--fader-feather) * 0.5),
    rgb(0 0 0 / 16%) calc(100% - var(--fader-feather) * 0.25),
    transparent
  );

  &::before,
  &::after {
    top: 0;
    width: var(--fader-dimension, 1.5rem);
    height: 100%;
  }

  &::before {
    left: 0;
    --dir: to right;
  }

  &::after {
    right: 0;
    --dir: to left;
  }
}

.pxd-fader--item.vertical {
  mask-image: linear-gradient(
    to right,
    transparent,
    rgb(0 0 0 / 16%) calc(var(--fader-feather) * 0.25),
    rgb(0 0 0 / 50%) calc(var(--fader-feather) * 0.5),
    rgb(0 0 0 / 84%) calc(var(--fader-feather) * 0.75),
    black var(--fader-feather),
    black calc(100% - var(--fader-feather)),
    rgb(0 0 0 / 84%) calc(100% - var(--fader-feather) * 0.75),
    rgb(0 0 0 / 50%) calc(100% - var(--fader-feather) * 0.5),
    rgb(0 0 0 / 16%) calc(100% - var(--fader-feather) * 0.25),
    transparent
  );

  &::before,
  &::after {
    left: 0;
    width: 100%;
    height: var(--fader-dimension, 1.5rem);
  }

  &::before {
    top: 0;
    --dir: to bottom;
  }

  &::after {
    bottom: 0;
    --dir: to top;
  }
}
</style>
