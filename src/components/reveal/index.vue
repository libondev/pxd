<script lang="ts" setup>
import type { RevealProps } from './types'
import { computed, shallowRef } from 'vue'
import { useIntersectionObserver } from '../../composables/use-intersection-observer.js'
import { getCssUnitValue } from '../../utils/format.js'

defineOptions({
  name: 'PReveal',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<RevealProps>(), {
  duration: 1000,
  delay: 0,
  distance: '1rem',
  from: 'bottom',
  trigger: 'mount',
  rootMargin: '0px',
  thresholdRate: 0,
})

const containerRef = shallowRef<HTMLElement>()
const revealed = shallowRef(props.trigger === 'mount')
const computedStyle = computed(() => ({
  '--reveal-duration': getTimeUnitValue(props.duration),
  '--reveal-delay': getTimeUnitValue(props.delay),
  '--reveal-distance': getCssUnitValue(props.distance),
}))

const target = computed(() => (props.trigger === 'viewport' ? containerRef.value : undefined))

const observerOptions = computed(() => ({
  root: props.root,
  rootMargin: props.rootMargin,
  threshold: props.thresholdRate,
}))

const { observer, stop } = useIntersectionObserver(
  target,
  ([{ entry }]) => {
    if (!entry.isIntersecting || revealed.value) {
      return
    }

    revealed.value = true

    stop()
  },
  observerOptions,
)

const gated = computed(() => props.trigger === 'viewport' && !!observer.value)

function getTimeUnitValue(value: number | string) {
  return typeof value === 'number' ? `${value}ms` : value
}
</script>

<template>
  <div
    data-reveal
    ref="containerRef"
    class="pxd-reveal motion-reduce:animate-none!"
    :data-direction="from"
    :data-play-state="gated && !revealed ? 'paused' : 'running'"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<style>
.pxd-reveal {
  --reveal-duration: 1000ms;
  --reveal-delay: 0ms;
  --reveal-distance: 1rem;
  --reveal-x: 0px;
  --reveal-y: 0px;

  animation-name: pxd-reveal-in;
  animation-duration: var(--reveal-duration);
  animation-delay: var(--reveal-delay);
  animation-timing-function: var(--default-transition-timing-function);
  animation-fill-mode: backwards;
}

.pxd-reveal[data-play-state='paused'] {
  animation-play-state: paused;
}

.pxd-reveal[data-direction='top'] {
  --reveal-y: calc(var(--reveal-distance) * -1);
}

.pxd-reveal[data-direction='bottom'] {
  --reveal-y: var(--reveal-distance);
}

.pxd-reveal[data-direction='left'] {
  --reveal-x: calc(var(--reveal-distance) * -1);
}

.pxd-reveal[data-direction='right'] {
  --reveal-x: var(--reveal-distance);
}

@keyframes pxd-reveal-in {
  from {
    opacity: 0;
    transform: translate(var(--reveal-x), var(--reveal-y));
  }
}
</style>
