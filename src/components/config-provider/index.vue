<script lang="ts" setup>
import type { ConfigProviderProps } from '../../composables/useConfigProviderContext'
import type { ComponentAs } from '../../types/components'
import { provideConfigProvider } from '../../composables/useConfigProviderContext'

interface Props extends ConfigProviderProps {
  as?: ComponentAs
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
