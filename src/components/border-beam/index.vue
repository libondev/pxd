<script lang="ts" setup>
import type { BorderBeamProps } from './types'
import { computed } from 'vue'
import { toArray } from '../../utils/format.js'

defineOptions({
  name: 'PBorderBeam',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<BorderBeamProps>(), {
  variant: 'glow',
  strength: 1,
  disabled: false,
})

// Number of color spots distributed around the border (matches the CSS gradients)
const COLOR_SPOT_COUNT = 9

const computedStyle = computed(() => {
  const style: Record<string, string | number> = {
    '--border-beam-strength': Math.max(0, Math.min(1, props.strength)),
  }

  const colors = toArray(props.color)

  if (colors.length > 0) {
    for (let index = 0; index < COLOR_SPOT_COUNT; index++) {
      const color = colors[index % colors.length]

      style[`--border-beam-stroke-color-${index + 1}`] = color
      style[`--border-beam-glow-color-${index + 1}`] =
        `color-mix(in srgb, ${color}, transparent 30%)`
    }
  }

  return style
})
</script>

<template>
  <div
    class="pxd-border-beam after:content-empty after:inset-0 before:content-empty before:inset-0 relative overflow-hidden before:pointer-events-none before:absolute before:z-1 before:rounded-inherit after:pointer-events-none after:absolute after:z-2 after:rounded-inherit after:p-px motion-reduce:animate-none! motion-reduce:before:animate-none! motion-reduce:after:animate-none!"
    :data-variant="variant"
    :data-disabled="disabled"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <slot />
    <div
      aria-hidden="true"
      class="pxd-border-beam--bloom inset-0 pointer-events-none absolute z-3 rounded-inherit p-px"
    />
  </div>
</template>

<style>
@property --pxd-border-beam-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: true;
}

.pxd-border-beam {
  --border-beam-strength: 1;
  --pxd-border-beam-angle: 0deg;
  animation: pxd-animation-border-beam-spin 1.96s linear infinite;
}

.pxd-border-beam[data-disabled='true'] {
  animation-play-state: paused;
}

.pxd-border-beam[data-disabled='true']::after,
.pxd-border-beam[data-disabled='true']::before,
.pxd-border-beam[data-disabled='true'] .pxd-border-beam--bloom {
  animation: pxd-animation-border-beam-fade-out 0.5s ease forwards;
}

.pxd-border-beam::after {
  opacity: calc(30% * var(--border-beam-strength));
  background:
    conic-gradient(
      from var(--pxd-border-beam-angle),
      transparent 0%,
      transparent 54%,
      rgba(255, 255, 255, 0.1) 57%,
      rgba(255, 255, 255, 0.3) 60%,
      rgba(255, 255, 255, 0.6) 63%,
      rgba(255, 255, 255, 0.75) 66%,
      rgba(255, 255, 255, 0.6) 69%,
      rgba(255, 255, 255, 0.3) 72%,
      rgba(255, 255, 255, 0.1) 75%,
      transparent 78%,
      transparent 100%
    ),
    radial-gradient(
      ellipse 70px 40px at 33% -7.4%,
      var(--border-beam-stroke-color-1, var(--color-pink-700)),
      transparent
    ),
    radial-gradient(
      ellipse 60px 35px at 12% -5%,
      var(--border-beam-stroke-color-2, var(--color-blue-600)),
      transparent
    ),
    radial-gradient(
      ellipse 40px 70px at 2.1% 68.3%,
      var(--border-beam-stroke-color-3, var(--color-green-600)),
      transparent
    ),
    radial-gradient(
      ellipse 20px 35px at 2.1% 68.3%,
      var(--border-beam-stroke-color-4, var(--color-teal-700)),
      transparent
    ),
    radial-gradient(
      ellipse 180px 32px at 74.4% 100%,
      var(--border-beam-stroke-color-5, var(--color-purple-600)),
      transparent
    ),
    radial-gradient(
      ellipse 85px 26px at 55% 100%,
      var(--border-beam-stroke-color-6, var(--color-blue-600)),
      transparent
    ),
    radial-gradient(
      ellipse 74px 32px at 93.9% 0%,
      var(--border-beam-stroke-color-7, var(--color-amber-600)),
      transparent
    ),
    radial-gradient(
      ellipse 26px 42px at 100% 27.1%,
      var(--border-beam-stroke-color-8, var(--color-pink-700)),
      transparent
    ),
    radial-gradient(
      ellipse 52px 48px at 100% 27.1%,
      var(--border-beam-stroke-color-9, var(--color-purple-700)),
      transparent
    );
  -webkit-mask:
    conic-gradient(
      from var(--pxd-border-beam-angle),
      transparent 0%,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 36%,
      rgba(255, 255, 255, 0.35) 44%,
      white 52%,
      white 80%,
      rgba(255, 255, 255, 0.35) 86%,
      rgba(255, 255, 255, 0.1) 92%,
      transparent 95%,
      transparent 100%
    ),
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: source-in, xor;
  mask:
    conic-gradient(
      from var(--pxd-border-beam-angle),
      transparent 0%,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 36%,
      rgba(255, 255, 255, 0.35) 44%,
      white 52%,
      white 80%,
      rgba(255, 255, 255, 0.35) 86%,
      rgba(255, 255, 255, 0.1) 92%,
      transparent 95%,
      transparent 100%
    ),
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: intersect, exclude;
  animation: pxd-animation-border-beam-hue 12s ease-in-out infinite;
}

.pxd-border-beam::before {
  opacity: calc(30% * var(--border-beam-strength));
  background:
    radial-gradient(
      ellipse 63px 36px at 33% -7.4%,
      var(--border-beam-glow-color-1, hsla(var(--color-pink-700-value), 30%)),
      transparent
    ),
    radial-gradient(
      ellipse 54px 32px at 12% -5%,
      var(--border-beam-glow-color-2, hsla(var(--color-blue-700-value), 30%)),
      transparent
    ),
    radial-gradient(
      ellipse 36px 63px at 2.1% 68.3%,
      var(--border-beam-glow-color-3, hsla(var(--color-green-700-value), 30%)),
      transparent
    ),
    radial-gradient(
      ellipse 18px 32px at 2.1% 68.3%,
      var(--border-beam-glow-color-4, hsla(var(--color-teal-700-value), 30%)),
      transparent
    ),
    radial-gradient(
      ellipse 162px 29px at 74.4% 100%,
      var(--border-beam-glow-color-5, hsla(var(--color-purple-700-value), 30%)),
      transparent
    ),
    radial-gradient(
      ellipse 77px 23px at 55% 100%,
      var(--border-beam-glow-color-6, hsla(var(--color-blue-700-value), 30%)),
      transparent
    ),
    radial-gradient(
      ellipse 67px 29px at 93.9% 0%,
      var(--border-beam-glow-color-7, hsla(var(--color-amber-700-value), 30%)),
      transparent
    ),
    radial-gradient(
      ellipse 23px 38px at 100% 27.1%,
      var(--border-beam-glow-color-8, hsla(var(--color-pink-700-value), 30%)),
      transparent
    ),
    radial-gradient(
      ellipse 47px 43px at 100% 27.1%,
      var(--border-beam-glow-color-9, hsla(var(--color-purple-700-value), 30%)),
      transparent
    );
  box-shadow: inset 0 0 9px 1px rgba(255, 255, 255, 0.27);
  -webkit-mask-image:
    conic-gradient(
      from var(--pxd-border-beam-angle),
      transparent 0%,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 36%,
      rgba(255, 255, 255, 0.35) 44%,
      white 52%,
      white 80%,
      rgba(255, 255, 255, 0.35) 86%,
      rgba(255, 255, 255, 0.1) 92%,
      transparent 95%,
      transparent 100%
    ),
    linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),
    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white);
  -webkit-mask-composite: source-in, source-over;
  mask-image:
    conic-gradient(
      from var(--pxd-border-beam-angle),
      transparent 0%,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 36%,
      rgba(255, 255, 255, 0.35) 44%,
      white 52%,
      white 80%,
      rgba(255, 255, 255, 0.35) 86%,
      rgba(255, 255, 255, 0.1) 92%,
      transparent 95%,
      transparent 100%
    ),
    linear-gradient(white, transparent 28px, transparent calc(100% - 28px), white),
    linear-gradient(to right, white, transparent 28px, transparent calc(100% - 28px), white);
  mask-composite: intersect, add;
  animation: pxd-animation-border-beam-hue 12s ease-in-out infinite;
}

.pxd-border-beam--bloom {
  opacity: calc(24% * var(--border-beam-strength));
  background: conic-gradient(
    from var(--pxd-border-beam-angle),
    transparent 0%,
    transparent 58%,
    rgba(255, 255, 255, 0.03) 62%,
    rgba(255, 255, 255, 0.08) 65%,
    rgba(255, 255, 255, 0.2) 67%,
    rgba(255, 255, 255, 0.45) 69%,
    rgba(255, 255, 255, 0.85) 70%,
    rgba(255, 255, 255, 0.85) 70.5%,
    rgba(255, 255, 255, 0.45) 71.5%,
    rgba(255, 255, 255, 0.2) 73%,
    rgba(255, 255, 255, 0.08) 75%,
    rgba(255, 255, 255, 0.03) 78%,
    transparent 82%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  filter: blur(4px) brightness(1.3) saturate(1.2);
}

.pxd-border-beam[data-variant='line']::before,
.pxd-border-beam[data-variant='line'] .pxd-border-beam--bloom {
  display: none;
}

.pxd-border-beam[data-variant='line']::after {
  opacity: var(--border-beam-strength);
  background: conic-gradient(
    from var(--pxd-border-beam-angle),
    transparent 0%,
    transparent 68%,
    var(--border-beam-stroke-color-1, var(--color-blue-600)) 74%,
    var(--border-beam-stroke-color-2, var(--color-purple-600)) 80%,
    var(--border-beam-stroke-color-3, var(--color-pink-700)) 86%,
    var(--border-beam-stroke-color-4, var(--color-amber-600)) 92%,
    transparent 97%,
    transparent 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: none;
  filter: none;
}

.pxd-border-beam[data-variant='line'][data-disabled='true']::after {
  animation: pxd-animation-border-beam-fade-out 0.5s ease forwards;
}

@keyframes pxd-animation-border-beam-spin {
  to {
    --pxd-border-beam-angle: 360deg;
  }
}

@keyframes pxd-animation-border-beam-hue {
  0% {
    filter: hue-rotate(-30deg) brightness(1.3) saturate(1.2);
  }
  50% {
    filter: hue-rotate(30deg) brightness(1.3) saturate(1.2);
  }
  100% {
    filter: hue-rotate(-30deg) brightness(1.3) saturate(1.2);
  }
}

@keyframes pxd-animation-border-beam-fade-out {
  to {
    opacity: 0;
  }
}
</style>
