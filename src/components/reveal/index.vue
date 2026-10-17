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
  duration: 1,
  delay: 0,
  distance: 16,
  direction: 'bottom',
  trigger: 'mount',
  rootMargin: '0px',
  threshold: 0,
})

const containerRef = shallowRef<HTMLElement>()
const revealed = shallowRef(props.trigger === 'mount')
const computedStyle = computed(() => ({
  '--reveal-duration': getTimeUnitValue(props.duration),
  '--reveal-delay': getTimeUnitValue(props.delay),
  '--reveal-distance': getCssUnitValue(props.distance),
}))
// Mount mode leaves the target unresolved, so the observer is never acquired.
const target = computed(() => (props.trigger === 'viewport' ? containerRef.value : undefined))

const observerOptions = computed(() => ({
  root: props.root,
  rootMargin: props.rootMargin,
  threshold: props.threshold,
}))

const { observer, stop } = useIntersectionObserver(
  target,
  ([{ entry }]) => {
    if (!entry.isIntersecting || revealed.value) {
      return
    }

    revealed.value = true

    // One-shot: a reveal never plays twice, so drop the subscription immediately.
    stop()
  },
  observerOptions,
)

/**
 * Gating arms only once an observer actually exists. Without it the paused `from`
 * frame would apply to a server-rendered element that can never be observed,
 * leaving that content permanently invisible.
 */
const gated = computed(() => props.trigger === 'viewport' && !!observer.value)

/** Bare numbers are seconds, matching the CSS `animation-*` time grammar. */
function getTimeUnitValue(value: number | string) {
  return typeof value === 'number' ? `${value}s` : value
}
</script>

<template>
  <div
    data-reveal
    ref="containerRef"
    class="pxd-reveal motion-reduce:animate-none!"
    :data-direction="direction"
    :data-play-state="gated && !revealed ? 'paused' : 'running'"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<style>
.pxd-reveal {
  --reveal-duration: 0.5s;
  --reveal-delay: 0s;
  --reveal-distance: 16px;
  --reveal-x: 0px;
  --reveal-y: 0px;

  animation-name: pxd-reveal-in;
  animation-duration: var(--reveal-duration);
  animation-delay: var(--reveal-delay);
  animation-timing-function: var(--default-transition-timing-function);
  /* `backwards` alone holds the `from` frame through the delay, which is all the
     paused state needs. `forwards` would additionally pin the animated values and
     leave a stacking context behind once the animation ends, so it stays off. */
  animation-fill-mode: backwards;
}

/* A paused animation sits in its before phase, so `fill-mode: backwards` holds the
   `from` frame — no separate hidden state and no end listener needed. */
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
