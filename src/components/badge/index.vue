<script lang="ts" setup>
import type { BadgeEmits, BadgeProps } from './types'
import CrossIcon from '@gdsicon/vue/cross'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { useConfigProvider } from '../../contexts/config-provider'

defineOptions({
  name: 'PBadge',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<BadgeProps>(), {
  as: 'span',
  shape: 'default',
  variant: 'pill',
})

const emits = defineEmits<BadgeEmits>()

const { attrs, classes: badgeClasses } = useTailwindVariant({
  base: 'pxd-badge font-medium gap-1 inline-flex items-center justify-center font-sans leading-none text-nowrap whitespace-nowrap no-underline! outline-none text-trim-both motion-safe:transition-appearance',
  variants: {
    variant: {
      pill: 'bg-background-100 shadow-border-base',
      primary: 'bg-primary text-gray-100',
      secondary: 'bg-gray-200 text-gray-1000 shadow-border-base',
      gray: 'text-white bg-gray-900',
      blue: 'bg-blue-800 text-gray-100 dark:text-gray-1000',
      purple: 'bg-purple-900 text-gray-100 dark:text-gray-1000',
      amber: 'bg-amber-700 text-gray-1000 dark:text-gray-100',
      red: 'bg-red-900 text-gray-100 dark:text-gray-1000',
      pink: 'bg-pink-900 text-gray-100 dark:text-gray-1000',
      green: 'bg-green-900 text-gray-100 dark:text-gray-1000',
      teal: 'bg-teal-900 text-gray-100 dark:text-gray-1000',
      'gray-subtle': 'bg-gray-200 text-gray-1000',
      'blue-subtle': 'bg-blue-200 text-blue-900',
      'purple-subtle': 'bg-purple-200 text-purple-900',
      'amber-subtle': 'bg-amber-200 text-amber-900',
      'red-subtle': 'bg-red-200 text-red-900',
      'pink-subtle': 'bg-pink-200 text-pink-900',
      'green-subtle': 'bg-green-200 text-green-900',
      'teal-subtle': 'bg-teal-200 text-teal-900',
      inverted: 'bg-gray-1000 text-gray-100',
      vue: 'bg-[linear-gradient(315deg,#42d392_25%,#647eff)] text-gray-100 dark:text-gray-1000',
      trial: 'bg-[linear-gradient(135deg,#0070f3,#f81ce5)] text-gray-100 dark:text-gray-1000',
      turborepo: 'bg-[linear-gradient(135deg,#ff1e56,#0096ff)] text-gray-100 dark:text-gray-1000',
    },
    shape: {
      default: 'rounded-md',
      square: 'rounded-none',
      rounded: 'rounded-full',
    },
    size: {
      sm: 'px-1.5 h-5 text-xs',
      md: 'px-2.5 h-6 text-xs',
      lg: 'px-3 h-8 text-sm',
    },
  },
})

const configProvider = useConfigProvider()

const computedClasses = computed(() => {
  const { variant, size = configProvider.size, shape } = props

  return badgeClasses({ variant, shape, size })
})

function onClose(ev: Event) {
  emits('close', ev)
}
</script>

<template>
  <Component :is="as" :class="computedClasses" :data-variant="variant" v-bind="attrs">
    <slot />

    <button
      v-if="closeable"
      class="pxd-badge--close p-1 -mr-1 relative cursor-pointer appearance-none rounded-full text-[.75em] self-focus-ring hover:bg-gray-alpha-200 active:bg-gray-alpha-300 motion-safe:transition-colors"
      @click.stop="onClose"
    >
      <CrossIcon class="pointer-events-none" />
    </button>
  </Component>
</template>
