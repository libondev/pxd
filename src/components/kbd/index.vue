<script setup lang="ts">
import { useConfigProvider } from 'pxd'
import { getFallbackValue } from 'pxd/utils/get'
import { computed } from 'vue'

interface Props {
  meta?: boolean
  shift?: boolean
  alt?: boolean
  ctrl?: boolean
  small?: boolean
  label?: string
  size?: 'md' | 'sm'
}

defineOptions({
  name: 'PKbd',
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
}

const config = useConfigProvider()
const computedSize = computed(() => getFallbackValue(props.size, SIZES, config.size))

const internalKey = computed(() => {
  return Object.entries(INTERNAL_KEYS).filter(([k]) => {
    return props[k as keyof Props]
  }).map(([,v]) => v).join('')
})
</script>

<template>
  <kbd
    class="pxd-keyboard px-1.5 font-sans ml-1 inline-flex items-center rounded-md border border-input bg-background-100 text-center text-gray-1000"
    :class="computedSize"
  >
    {{ internalKey }}
    <slot>{{ label }}</slot>
  </kbd>
</template>
