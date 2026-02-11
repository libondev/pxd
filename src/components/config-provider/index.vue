<script lang="ts" setup>
import type { ConfigProviderProps } from './types'
import type { ComponentAs } from '../../types/shared'
import { provideConfigProvider } from '../../contexts/config-provider'
import enUS from '../../locales/en-us'

interface Props extends ConfigProviderProps {
  as?: ComponentAs
}

defineOptions({
  name: 'PConfigProvider',
})

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  size: 'md',
  locale: () => enUS,
  popoverShowTransition: true,
})

provideConfigProvider(props)
</script>

<template>
  <Component :is="as" class="pxd-config-provider h-inherit">
    <slot />
  </Component>
</template>
