<script lang="ts" setup>
import type { KbdProps } from './types'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { getFallbackValue } from '../../utils/helper'

defineOptions({
  name: 'PKbd',
  inheritAttrs: false,
})

const props = defineProps<KbdProps>()

const SIZES = {
  sm: 'h-5 text-xs',
  md: 'h-6 text-sm',
  lg: 'h-7 text-sm',
}

const INTERNAL_KEYS = {
  meta: '⌘',
  shift: '⇧',
  alt: '⌥',
  ctrl: 'Ctrl',
  enter: '↵',
}

const configProvider = useConfigProvider()
const computedSize = computed(() => getFallbackValue(props.size, SIZES, configProvider.size))

const internalKey = computed(() => {
  return Object.entries(INTERNAL_KEYS)
    .filter(([k]) => {
      return props[k as keyof KbdProps]
    })
    .map(([, v]) => v)
    .join('')
})
</script>

<template>
  <kbd
    class="pxd-keyboard px-1.5 ml-1 inline-flex items-center rounded-md border bg-background-100 text-center font-sans leading-none text-nowrap whitespace-nowrap text-gray-1000 text-trim-both"
    :class="computedSize"
    v-bind="$attrs"
  >
    {{ internalKey }}
    <slot>{{ label }}</slot>
  </kbd>
</template>
