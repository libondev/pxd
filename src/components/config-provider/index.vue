<script lang="ts" setup>
import type { VNode } from 'vue'
import { type ComponentSize, defaultConfig, provideConfigProvider } from '../../composables/useConfigProviderContext'

interface Props {
  as?: keyof HTMLElementTagNameMap | VNode
  size?: ComponentSize
}

defineOptions({
  name: 'PConfigProvider',
})

const props = withDefaults(
  defineProps<Props>(),
  { as: 'div', ...defaultConfig },
)

provideConfigProvider(props)
</script>

<template>
  <component :is="as" class="pxd-config-provider">
    <slot />
  </component>
</template>
