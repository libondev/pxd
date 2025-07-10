<script lang="ts" setup>
import type { ComponentLabel, ResponsiveValue } from '../../types/components'
import { computed } from 'vue'

interface Props {
  color?: string
  title?: ComponentLabel
  width?: number | string | ResponsiveValue<number>
  variant?: 'simple' | 'stripe'
  textured?: boolean
}

defineOptions({
  name: 'PBook',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    width: 196,
    textured: false,
    variant: 'stripe',
  },
)

const presetWidthClasses = {
  '--width-xs': '[--book-width:var(--width-xs)]',
  '--width-sm': 'sm:[--book-width:var(--width-sm)]',
  '--width-md': 'md:[--book-width:var(--width-md)]',
  '--width-lg': 'lg:[--book-width:var(--width-lg)]',
  '--width-xl': 'xl:[--book-width:var(--width-xl)]',
}

const formattedWidth = computed(() => {
  const { width } = props

  const defaultWidth = {
    '--width-xs': typeof width === 'object' ? width.xs || 196 : width,
  } as Record<string, string | number>

  if (typeof width === 'object') {
    return Object.entries(width).reduce((acc, [bp, value]) => {
      acc[`--width-${bp}`] = value

      return acc
    }, defaultWidth)
  }

  return defaultWidth
})

const computedStyle = computed(() => {
  const { color } = props

  return {
    ...formattedWidth.value,
    '--book-color': color,
  }
})

const computedClass = computed(() => {
  const basic = ['pxd-book--container w-fit relative transform-3d duration-300 motion-safe:transition-transform']

  basic.push(
    ...Object.keys(formattedWidth.value).map(bp => presetWidthClasses[bp as keyof typeof presetWidthClasses]),
  )

  return basic
})
</script>

<template>
  <div class="pxd-book inline-flex w-fit">
    <div
      :class="computedClass"
      :style="computedStyle"
    >
      <div class="pxd-book--content flex flex-col h-full overflow-hidden translate-z-0 relative bg-background-secondary">
        <div
          v-if="variant === 'stripe'"
          class="flex w-full relative flex-1 overflow-hidden translate-z-0"
          style="background-color: var(--book-color, var(--color-amber-600))"
        >
          <div class="absolute flex flex-col w-full object-cover">
            <slot name="icon" />
          </div>

          <div aria-hidden="true" class="pxd-book--spine absolute left-0 h-full mix-blend-overlay" />
        </div>

        <div
          :class="{ 'pxd-book--cover-simple': variant === 'simple' }"
          class="flex w-full relative flex-1 overflow-hidden translate-z-0"
        >
          <div aria-hidden="true" class="pxd-book--spine h-full opacity-20" />

          <div class="pxd-book--content-inner flex flex-col w-full">
            <span class="pxd-book--title font-semibold text-balance break-all pr-2">
              <slot name="title">
                {{ title }}
              </slot>
            </span>

            <div v-if="variant === 'simple'" class="pxd-book--icon">
              <slot name="icon">
                <svg fill="none" height="56" viewBox="0 0 36 56" width="36" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M3.03113 28.0005C6.26017 23.1765 11.7592 20.0005 18 20.0005C24.2409 20.0005 29.7399 23.1765 32.9689 28.0005C29.7399 32.8244 24.2409 36.0005 18 36.0005C11.7592 36.0005 6.26017 32.8244 3.03113 28.0005Z" fill="#0070F3" fill-rule="evenodd" /><path clip-rule="evenodd" d="M32.9691 28.0012C34.8835 25.1411 36 21.7017 36 18.0015C36 8.06034 27.9411 0.00146484 18 0.00146484C8.05887 0.00146484 0 8.06034 0 18.0015C0 21.7017 1.11648 25.1411 3.03094 28.0012C6.25996 23.1771 11.7591 20.001 18 20.001C24.2409 20.001 29.74 23.1771 32.9691 28.0012Z" fill="#45DEC4" fill-rule="evenodd" /><path clip-rule="evenodd" d="M32.9692 28.0005C29.7402 32.8247 24.241 36.001 18 36.001C11.759 36.001 6.25977 32.8247 3.03077 28.0005C1.11642 30.8606 0 34.2999 0 38C0 47.9411 8.05887 56 18 56C27.9411 56 36 47.9411 36 38C36 34.2999 34.8836 30.8606 32.9692 28.0005Z" fill="#E5484D" fill-rule="evenodd" /></svg>
              </slot>
            </div>
          </div>
        </div>

        <div v-if="textured" class="pxd-book--textured absolute inset-0 opacity-50 pointer-events-none bg-cover" />
      </div>

      <div aria-hidden="true" class="pxd-book--pages absolute" />
      <div aria-hidden="true" class="pxd-book--back absolute left-0 h-full bg-gray-200" />
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-book {
  --book-default-width: 196;
  --book-depth: 29cqw;
  --book-border-radius: 6px 4px 4px 6px;
  --hover-rotate: -20deg;
  --hover-scale: 1.066;
  --hover-translate-x: -8px;
  --aspect-ratio: 49 / 60;
  --bg-shadow: linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0) 12%,rgba(255,255,255,0.25) 29.25%,rgba(255,255,255,0) 50.5%,rgba(255,255,255,0) 75.25%,rgba(255,255,255,0.25) 91%,rgba(255,255,255,0)),linear-gradient(90deg,rgba(0,0,0,0.03),rgba(0,0,0,0.1) 12%,rgba(0,0,0,0) 30%,rgba(0,0,0,0.02) 50%,rgba(0,0,0,0.2) 73.5%,rgba(0,0,0,0.5) 75.25%,rgba(0,0,0,0.15) 85.25%,rgba(0,0,0,0));

  perspective: 900px;
}

.pxd-book--container {
  aspect-ratio: var(--aspect-ratio);
  transform: rotate(0deg);
  width: calc(var(--book-width) * 1px);
  container-type: inline-size;
}

.pxd-book--content {
  position: absolute;
  width: 100%;
  min-width: 100%;
  border-radius: var(--book-border-radius);
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, .02), 0 4px 8px -4px rgba(0, 0, 0, .1), 0 16px 24px -8px rgba(0, 0, 0, .03);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid var(--color-gray-alpha-200);
    width: 100%;
    height: 100%;
    border-radius: inherit;
    box-shadow: inset 0 1px 2px 0 var(--color-gray-alpha-200);
    pointer-events: none;
  }
}

.dark .pxd-book--content{
  background: linear-gradient(180deg, rgba(255, 255, 255, .1), rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0)), hsla(0, 0%, 12%, 1);
  box-shadow: 0 1.8px 3.6px rgba(0, 0, 0, .05), 0 10.8px 21.6px rgba(0, 0, 0, .08), inset 0 -.9px 0 rgba(0, 0, 0, .1), inset 0 1.8px 1.8px rgba(255, 255, 255, .1), inset 3.6px 0 3.6px rgba(0, 0, 0, .1);
}

.pxd-book--content-inner {
  gap: calc((24px / var(--book-default-width)) * var(--book-width));
  padding: 6.1%;
  container-type: inline-size;
}

.pxd-book--cover-simple {
  background-color: var(--book-color, var(--color-gray-200));
}

.pxd-book--textured {
  background-image: url(https://assets.vercel.com/image/upload/v1720554484/front/design/book-texture.avif);
  border-radius: var(--book-border-radius);
  mix-blend-mode: hard-light;
  background-repeat: no-repeat;
  filter: brightness(1.1);
}

.pxd-book--spine {
  width: 8.2%;
  min-width: 8.2%;
  background: var(--bg-shadow);
}

.pxd-book--title {
  line-height: 1.25em;
  font-size: 12cqw;
  letter-spacing: -.02em;
}

.pxd-book--pages {
  top: 3px;
  height: calc(100% - 2 * 3px);
  width: calc(var(--book-depth) - 2px);
  transform: translateX(calc(var(--book-width) * 1px - var(--book-depth) / 2 - 3px)) rotateY(90deg) translateX(calc(var(--book-depth) / 2));
  background: linear-gradient(90deg, #eaeaea, transparent 70%), linear-gradient(#fff, #fafafa);
}

.pxd-book--back {
  width: 100%;
  border-radius: var(--book-border-radius);
  transform: translateZ(calc(-1 * var(--book-depth)));
}

.pxd-book:hover .pxd-book--container {
  transform: rotateY(var(--hover-rotate)) scale(var(--hover-scale)) translateX(var(--hover-translate-x));
}
</style>
