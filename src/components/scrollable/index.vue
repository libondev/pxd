<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

interface Props {
  size?: number
  fader?: boolean
  color?: string
  scrollbar?: boolean
}

defineOptions({
  name: 'PScrollable',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    size: 30,
    fader: true,
    scrollbar: true,
  },
)

const scrollContainer = shallowRef<HTMLElement>(null!)

const faderDirections = ref({
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
    clientHeight,
  } = ev.target as HTMLElement

  const hasTop = scrollTop >= props.size
  const hasBottom = scrollTop + clientHeight !== scrollHeight
  const hasLeft = scrollLeft >= props.size
  const hasRight = scrollLeft + clientWidth !== scrollWidth

  faderDirections.value = {
    top: hasTop,
    left: hasLeft,
    right: hasRight,
    bottom: hasBottom,
  }
}

onMounted(async () => {
  await nextTick()

  if (!props.scrollbar && !props.fader) {
    return
  }

  const container = scrollContainer.value

  const hasScrollbarX = container.scrollWidth > container.clientWidth
  const hasScrollbarY = container.scrollHeight > container.clientHeight

  faderDirections.value.right = hasScrollbarX
  faderDirections.value.bottom = hasScrollbarY

  container.addEventListener('scroll', onContainerScroll, { passive: true })
})

onBeforeUnmount(() => {
  scrollContainer.value.removeEventListener('scroll', onContainerScroll)
})
</script>

<template>
  <div class="pxd-scrollable relative overflow-hidden" :style="{ '--size': `${size}px`, '--color': color }">
    <div
      ref="scrollContainer"
      class="pxd-scrollable--content w-full h-full scrollbar-hidden overflow-scroll"
    >
      <slot />
    </div>

    <template v-if="fader">
      <div
        aria-hidden="true"
        :class="{ left: faderDirections.left, right: faderDirections.right }"
        class="pxd-scrollable--x-fader pointer-events-none w-full h-full absolute inset-0"
      />
      <div
        aria-hidden="true"
        :class="{ top: faderDirections.top, bottom: faderDirections.bottom }"
        class="pxd-scrollable--y-fader pointer-events-none w-full h-full absolute inset-0"
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
    mask-image: linear-gradient(var(--dir-revert), var(--color, var(--background-100)) 33%, transparent);
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
