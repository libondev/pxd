<script lang="ts" setup>
import type { VNode } from 'vue'
import type { ConfigProviderProps } from '../../composables/useConfigProviderContext'
import { provideConfigProvider } from '../../composables/useConfigProviderContext'

interface Props extends ConfigProviderProps {
  as?: keyof HTMLElementTagNameMap | VNode
}

defineOptions({
  name: 'PConfigProvider',
})

const props = withDefaults(
  defineProps<Props>(),
  { as: 'div', size: 'md' },
)

provideConfigProvider(props)
</script>

<template>
  <component :is="as" class="pxd-config-provider">
    <slot />
  </component>
</template>
