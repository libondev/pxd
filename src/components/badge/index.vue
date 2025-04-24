<script setup lang="ts">
import { twMerge } from 'tailwind-merge'
import { computed, useAttrs } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'

interface Props {
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
    variant: 'default',
  },
)

const attrs = useAttrs()
const config = useConfigProvider()

const SIZES = {
  sm: 'px-1.5 h-5 text-xs',
  md: 'px-2.5 h-6 text-sm',
  lg: 'px-3 h-7 text-md',
}

const VARIANTS = {
  'pill': 'bg-background shadow-[0_0_0_1px_var(--color-gray-300)]',
  'default': 'bg-background-100',
  'gray': 'bg-gray-700 text-background',
  'blue': 'bg-blue-700 text-background',
  'purple': 'bg-purple-700 text-background',
  'amber': 'bg-amber-700',
  'red': 'bg-red-700 text-background',
  'pink': 'bg-pink-700 text-background',
  'green': 'bg-green-700 text-background',
  'teal': 'bg-teal-700 text-background',
  'gray-subtle': 'bg-gray-200 text-gray-1000',
  'blue-subtle': 'bg-blue-200 text-blue-700',
  'purple-subtle': 'bg-purple-200 text-purple-700',
  'amber-subtle': 'bg-amber-200 text-amber-700',
  'red-subtle': 'bg-red-200 text-red-700',
  'pink-subtle': 'bg-pink-200 text-pink-700',
  'green-subtle': 'bg-green-200 text-green-700',
  'teal-subtle': 'bg-teal-200 text-teal-700',
  'inverted': 'bg-gray-1000 text-background',
  'vue': 'text-background bg-gradient-to-br from-[#42d392] via-[#42d392] via-25% to-[#647eff]',
  'trial': 'text-background bg-gradient-to-br from-[#0070f3] to-[#f81ce5]',
  'turborepo': 'text-background bg-gradient-to-br from-[#ff1e56] to-[#0096ff]',
}

const badgeRenderType = computed(() => {
  return props.variant === 'pill' ? 'a' : 'span'
})

const computedClass = computed(() =>
  twMerge(
    'pxd-badge inline-flex items-center justify-center font-medium px-2.5 h-6 text-xs rounded-full font-sans',
    VARIANTS[props.variant],
    SIZES[props.size || config.size],
    attrs.class as string,
  ),
)
</script>

<template>
  <component :is="badgeRenderType" :class="computedClass" :href="href">
    <slot />
  </component>
</template>
