<script setup lang="ts">
import type { ComponentLabel } from 'pxd'
import type { ComponentSize } from '../../types/shared'
import { useConfigProvider } from 'pxd'
import { computed } from 'vue'
import { getFallbackValue } from '../../utils/get'

interface Props {
  alt?: boolean
  ctrl?: boolean
  meta?: boolean
  enter?: boolean
  shift?: boolean
  label?: ComponentLabel
  size?: ComponentSize
}

defineOptions({
  name: 'PKbd',
  inheritAttrs: false,
})

const props = defineProps<Props>()

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

const config = useConfigProvider()
const computedSize = computed(() => getFallbackValue(props.size, SIZES, config.size))

const internalKey = computed(() => {
  return Object.entries(INTERNAL_KEYS)
    .filter(([k]) => {
      return props[k as keyof Props]
    })
    .map(([, v]) => v)
    .join('')
})
</script>

<template>
  <kbd
    class="pxd-keyboard px-1.5 ml-1 inline-flex items-center rounded-md border border-input bg-background-100 text-center font-sans text-nowrap whitespace-nowrap text-gray-1000"
    :class="computedSize"
    v-bind="$attrs"
  >
    {{ internalKey }}
    <slot>{{ label }}</slot>
  </kbd>
</template>
