<script setup lang="ts">
import type { ComponentDirection } from '../../types/shared/props'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { off, on } from '../../utils/events'
import { throttleByRaf } from '../../utils/fn'
import { getCssUnitValue } from '../../utils/format'

interface Props {
  size?: number
  color?: string
  container: HTMLElement | undefined | null
  direction?: ComponentDirection | 'both'
}

defineOptions({
  name: 'PFader',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    direction: 'both',
  },
)

const fader = shallowRef({
  top: false,
  left: false,
  right: false,
  bottom: false,
})

const computedStyle = computed(() => ({
  '--c': props.color,
  '--s': getCssUnitValue(props.size),
}))

const DIFF_THRESHOLD = 1

const onContainerScroll = throttleByRaf(() => {
  const { size = 16 } = props
  const { scrollLeft, scrollWidth, clientWidth, scrollTop, clientHeight, scrollHeight } = props.container!

  fader.value = {
    left: scrollLeft >= size,
    right: scrollLeft + clientWidth < scrollWidth - DIFF_THRESHOLD,
    top: scrollTop >= size,
    bottom: scrollTop + clientHeight < scrollHeight - DIFF_THRESHOLD,
  }
})

watch(() => props.container, (container, oldDom) => {
  if (oldDom) {
    off(oldDom, 'scroll', onContainerScroll)

    return
  }

  if (!container) {
    return
  }

  onContainerScroll()
  on(container, 'scroll', onContainerScroll)
})

onBeforeUnmount(() => {
  off(props.container, 'scroll', onContainerScroll)
})
</script>

<template>
  <div
    aria-hidden="true"
    class="pxd-fader inset-0 pointer-events-none absolute size-full rounded-inherit"
    :style="computedStyle"
  >
    <div v-if="['both', 'horizontal'].includes(direction)" class="pxd-fader--item horizontal inset-0 absolute rounded-inherit" :class="{ left: fader.left, right: fader.right }" />
    <div v-if="['both', 'vertical'].includes(direction)" class="pxd-fader--item vertical inset-0 absolute rounded-inherit" :class="{ top: fader.top, bottom: fader.bottom }" />
  </div>
</template>

<style lang="postcss">
.pxd-fader--item::before,
.pxd-fader--item::after {
  content: '';
  position: absolute;
  border-radius: inherit;
  background: linear-gradient(var(--dir), transparent, var(--c, var(--color-gray-alpha-500)));
  mask-image: linear-gradient(var(--dir-revert), var(--c, var(--color-gray-alpha-500)) 50%, transparent);
  transition: opacity var(--default-transition-timing-function) var(--default-transition-duration);
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
    width: var(--s, 16px);
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
    height: var(--s, 16px);
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
