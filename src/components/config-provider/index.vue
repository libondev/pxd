<script lang="ts" setup>
import type { ComponentAs } from '../../types/shared'
import type { ConfigProviderProps } from './types'
import { provideConfigProvider } from '../../contexts/config-provider'
import enUS from '../../locales/en-us'
import { NOOP } from '../../utils/event'

interface Props extends ConfigProviderProps {
  as?: ComponentAs
}

defineOptions({
  name: 'PConfigProvider',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  size: 'md',
  locale: () => enUS,
  enterMotion: true,
  leaveMotion: true,
})

provideConfigProvider(props)
</script>

<template>
  <Component :is="as" class="pxd-config-provider h-inherit" @touchstart="NOOP" v-bind="$attrs">
    <slot />
  </Component>
</template>
