<script lang="ts" setup>
import type { ConfigProviderProps } from '../../composables/use-config-provider-context'
import type { ComponentAs } from '../../types/shared'
import { provideConfigProvider } from '../../composables/use-config-provider-context'
import enUS from '../../locales/en-us'

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
  <Component :is="as" class="pxd-config-provider">
    <slot />
  </component>
</template>
