<script lang="ts" setup>
import type { ConfigProviderProps } from '../../composables/useConfigProviderContext'
import type { ComponentAs } from '../../types/components'
import { provideConfigProvider } from '../../composables/useConfigProviderContext'
import enUS from '../../locales/en-US'

interface Props extends ConfigProviderProps {
  as?: ComponentAs
}

defineOptions({
  name: 'PConfigProvider',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    as: 'div',
    size: 'md',
    locale: () => enUS,
  },
)

provideConfigProvider(props)
</script>

<template>
  <component :is="as" class="pxd-config-provider">
    <slot />
  </component>
</template>
