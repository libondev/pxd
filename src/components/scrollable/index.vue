<script setup lang="ts">
import { nextTick, onMounted, ref, shallowRef } from 'vue'

interface Props {
  size?: number
  fader?: boolean
  color?: string
}

defineOptions({
  name: 'PScrollable',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    size: 40,
    fader: true
  },
)

const scrollContainer = shallowRef<HTMLElement>(null!)

const scrollDirs = ref({
  top: false,
  left: false,
  right: false,
  bottom: false,
})

function onContainerScroll(ev: Event) {
  const {
    scrollTop,
    scrollLeft,
    scrollWidth,
    scrollHeight,
    clientWidth,
    clientHeight
  } = ev.target as HTMLElement

  const hasTop = scrollTop >= props.size
  const hasBottom = scrollTop + clientHeight !== scrollHeight
  const hasLeft = scrollLeft >= props.size
  const hasRight = scrollLeft + clientWidth !== scrollWidth

  scrollDirs.value = {
    top: hasTop,
    left: hasLeft,
    right: hasRight,
    bottom: hasBottom
  }
}

onMounted(async () => {
  await nextTick()

  const hasScrollbarX = scrollContainer.value.scrollWidth > scrollContainer.value.clientWidth
  const hasScrollbarY = scrollContainer.value.scrollHeight > scrollContainer.value.clientHeight

  scrollDirs.value.right = hasScrollbarX
  scrollDirs.value.bottom = hasScrollbarY
})
</script>

<template>
  <div class="pxd-scrollable relative overflow-hidden" :style="{ '--size': size + 'px', '--color': color }">
    <div
      ref="scrollContainer"
      class="pxd-scrollable--content w-full h-full scrollbar-hidden overflow-scroll"
      @scroll="onContainerScroll"
    >
      <slot />
    </div>

    <template v-if="fader">
      <div
        aria-hidden="true"
        :class="{ left: scrollDirs.left, right: scrollDirs.right }"
        class="pxd-scrollable--x-fader z-10 pointer-events-none w-full h-full absolute inset-0"
      />
      <div
        aria-hidden="true"
        :class="{ top: scrollDirs.top, bottom: scrollDirs.bottom }"
        class="pxd-scrollable--y-fader z-10 pointer-events-none w-full h-full absolute inset-0"
      />
    </template>
  </div>
</template>

<style lang="postcss">
.pxd-scrollable--x-fader,
.pxd-scrollable--y-fader {
  &::before,
  &::after {
    content: '';
    position: absolute;
    backdrop-filter: blur(10px);
    background: linear-gradient(var(--dir), transparent, var(--color, var(--background-100)));
    mask-image: linear-gradient(var(--dir-revert), var(--color, var(--background-100)) 40%, transparent);
    opacity: 0;
  }

  &.left::before,
  &.right::after,
  &.top::before,
  &.bottom::after {
    opacity: 1;
  }
}

.pxd-scrollable--x-fader {
  &::before,
  &::after {
    top: 0;
    width: var(--size, 30px);
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

.pxd-scrollable--y-fader {
  &::before,
  &::after {
    left: 0;
    width: 100%;
    height: var(--size, 30px);
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

@media (prefers-reduced-motion: no-preference) {
  .pxd-scrollable--x-fader,
  .pxd-scrollable--y-fader {
    &::before,
    &::after {
      transition: opacity .2s ease-out;
    }
  }
}
</style>
