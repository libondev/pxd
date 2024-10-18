<script setup lang="ts">
interface BadgeProps {
  variant?: keyof typeof VARIANTS
}

withDefaults(
  defineProps<BadgeProps>(),
  {
    variant: 'default',
  },
)

const VARIANTS = {
  'default': 'font-medium bg-background-100',
  'gray': 'font-medium bg-gray-700 text-background-100',
  'blue': 'font-medium bg-blue-700 text-background-100',
  'purple': 'font-medium bg-purple-700 text-background-100',
  'amber': 'font-medium bg-amber-700',
  'red': 'font-medium bg-red-700 text-background-100',
  'pink': 'font-medium bg-pink-700 text-background-100',
  'green': 'font-medium bg-green-700 text-background-100',
  'teal': 'font-medium bg-teal-700 text-background-100',
  'gray-subtle': 'font-medium bg-gray-200 text-gray-1000',
  'blue-subtle': 'font-medium bg-blue-200 text-blue-700',
  'purple-subtle': 'font-medium bg-purple-200 text-purple-700',
  'amber-subtle': 'font-medium bg-amber-200 text-amber-700',
  'red-subtle': 'font-medium bg-red-200 text-red-700',
  'pink-subtle': 'font-medium bg-pink-200 text-pink-700',
  'green-subtle': 'font-medium bg-green-200 text-green-700',
  'teal-subtle': 'font-medium bg-teal-200 text-teal-700',

  'inverted': 'font-medium bg-gray-1000 text-background-100',
  'vue': 'font-medium text-background-100 bg-gradient-to-br from-[#42d392] via-[#42d392] via-25% to-[#647eff]',
  'trial': 'font-medium text-background-100 bg-gradient-to-br from-[#0070f3] to-[#f81ce5]',
  'turborepo': 'font-medium text-background-100 bg-gradient-to-br from-[#ff1e56] to-[#0096ff]',
}
</script>

<template>
  <span class="pxd-badge inline-flex items-center justify-center px-2.5 h-6 text-xs rounded-full" :class="VARIANTS[variant]">
    <slot />
  </span>
</template>
