<script lang="ts" setup>
import type { ComponentAs } from '../../types/shared'
import type { ConfigProviderProps } from './types'
import { computed } from 'vue'
import { provideConfigProvider } from '../../contexts/config-provider'
import enUS from '../../locales/en-us'
import { NOOP } from '../../utils/event'
import { mergeDeep } from '../../utils/merge'

interface Props {
  as?: ComponentAs
  size?: ConfigProviderProps['size']
  locale?: ConfigProviderProps['locale']
  enterMotion?: ConfigProviderProps['enterMotion']
  leaveMotion?: ConfigProviderProps['leaveMotion']
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

const locale = computed(() => mergeDeep(enUS, props.locale))

provideConfigProvider({
  get size() {
    return props.size
  },
  get locale() {
    return locale.value
  },
  get enterMotion() {
    return props.enterMotion
  },
  get leaveMotion() {
    return props.leaveMotion
  },
})
</script>

<template>
  <Component :is="as" class="pxd-config-provider h-inherit" @touchstart="NOOP" v-bind="$attrs">
    <slot />
  </Component>
</template>
