<script setup lang="ts">
import type { BadgeProps } from './types'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { badgeVariant } from './cn'

defineOptions({
  name: 'PBadge',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<BadgeProps>(), {
  as: 'span',
  variant: 'gray',
})

const configProvider = useConfigProvider()

const computedClasses = computed(() => {
  const { variant, size = configProvider.size } = props

  return badgeVariant({ variant, size })
})
</script>

<template>
  <Component :is="as" :class="computedClasses" v-bind="$attrs">
    <slot />
  </Component>
</template>

<style lang="postcss">
.pxd-badge {
  &.pill {
    box-shadow: 0 0 0 1px var(--color-gray-300);
  }

  &.vue {
    background: linear-gradient(315deg, #42d392 25%, #647eff);
  }

  &.trial {
    background: linear-gradient(135deg, #0070f3, #f81ce5);
  }

  &.turborepo {
    background: linear-gradient(135deg, #ff1e56, #0096ff);
  }
}
</style>
