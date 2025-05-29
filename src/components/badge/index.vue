<script setup lang="ts">
import type { ComponentAs } from '../../types/components'
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'
import { getFallbackVariant, useComputedSize } from '../../composables/useFallbackProps'

interface Props {
  as?: ComponentAs
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  href?: string
}

defineOptions({
  name: 'PBadge',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    as: 'span',
    variant: 'gray',
  },
)

const SIZES = {
  sm: 'px-1.5 h-5 text-xs',
  md: 'px-2.5 h-6 text-xs',
  lg: 'px-3 h-7.5 text-sm',
}

const VARIANTS = {
  'pill': 'bg-background shadow-[0_0_0_1px_var(--color-gray-300)]',
  'gray': 'bg-gray-600 text-white',
  'blue': 'bg-blue-700 text-gray-100 dark:text-gray-1000',
  'purple': 'bg-purple-700 text-gray-100 dark:text-gray-1000',
  'amber': 'bg-amber-700 text-gray-1000 dark:text-gray-100',
  'red': 'bg-red-700 text-gray-100 dark:text-gray-1000',
  'pink': 'bg-pink-700 text-gray-100 dark:text-gray-1000',
  'green': 'bg-green-700 text-gray-100 dark:text-gray-1000',
  'teal': 'bg-teal-700 text-gray-100 dark:text-gray-1000',
  'gray-subtle': 'bg-gray-200 text-gray-1000',
  'blue-subtle': 'bg-blue-200 text-blue-900',
  'purple-subtle': 'bg-purple-200 text-purple-900',
  'amber-subtle': 'bg-amber-200 text-amber-900',
  'red-subtle': 'bg-red-200 text-red-900',
  'pink-subtle': 'bg-pink-200 text-pink-900',
  'green-subtle': 'bg-green-200 text-green-900',
  'teal-subtle': 'bg-teal-200 text-teal-900',
  'inverted': 'bg-gray-1000 text-gray-100',
  'vue': 'text-gray-100 dark:text-gray-1000',
  'trial': 'text-gray-100 dark:text-gray-1000',
  'turborepo': 'text-gray-100 dark:text-gray-1000',
}

const computedSize = useComputedSize(props.size, SIZES)

const computedClass = computed(() =>
  twMerge(
    'pxd-badge inline-flex items-center justify-center px-2.5 font-medium h-6 text-xs rounded-full font-sans gap-1 !no-underline motion-safe:transition-all',
    getFallbackVariant(props.variant, VARIANTS, 'gray'),
    computedSize.value,
    props.variant,
  ),
)

const badgeAttrs = computed(() => {
  if (props.as === 'router-link' || props.as === 'RouterLink') {
    return {
      to: props.href,
    }
  } else if (props.as === 'a') {
    return {
      href: props.href,
    }
  }

  return {}
})
</script>

<template>
  <component :is="as" :class="computedClass" v-bind="badgeAttrs">
    <slot />
  </component>
</template>

<style>
.pxd-badge.pill {
  box-shadow: 0 0 0 1px var(--color-gray-300);
}

.pxd-badge.vue {
  background: linear-gradient(315deg, #42d392 25%, #647eff);
}

.pxd-badge.trial {
  background: linear-gradient(135deg, #0070f3, #f81ce5);
}

.pxd-badge.turborepo {
  background: linear-gradient(135deg, #ff1e56, #0096ff);
}
</style>
