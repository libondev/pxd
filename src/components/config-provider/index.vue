<script lang="ts" setup>
import type { VNode } from 'vue'
import { provideConfigProvider, defaultConfig, type ComponentSize } from '../../composables/useConfigProvider'

interface Props {
  as?: keyof HTMLElementTagNameMap | VNode
  size?: ComponentSize
}

const props = withDefaults(
  defineProps<Props>(),
  { as: 'div', ...defaultConfig },
)

defineOptions({
  name: 'PConfigProvider',
})

provideConfigProvider(props)
</script>

<template>
  <component :is="as">
    <slot />
  </component>
</template>
