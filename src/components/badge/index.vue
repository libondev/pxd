<script setup lang="ts">
import type { ComponentAs, ComponentSize } from '../../types/shared'
import type { BadgeVariant } from './cn'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { badgeVariant } from './cn'

interface Props {
  as?: ComponentAs
  href?: string
  size?: ComponentSize
  variant?: BadgeVariant
}

defineOptions({
  name: 'PBadge',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<Props>(), {
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
