<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  meta?: boolean
  shift?: boolean
  alt?: boolean
  ctrl?: boolean
  small?: boolean
  label?: string
}

defineOptions({
  name: 'PKbd',
})

const props = defineProps<Props>()

const INTERNAL_KEYS = {
  meta: '⌘',
  shift: '⇧',
  alt: '⌥',
  ctrl: 'Ctrl',
}
const internalKey = computed(() => {
  return Object.entries(INTERNAL_KEYS).filter(([k]) => {
    return props[k as keyof Props]
  }).map(([,v]) => v).join('')
})
</script>

<template>
  <kbd
    class="pxd-keyboard px-1.5 font-sans ml-1 inline-flex items-center rounded-md border border-input bg-background-100 text-center text-gray-1000"
    :class="[small ? 'h-5 text-xs' : 'h-6 text-sm']"
  >
    {{ internalKey }}
    <slot>{{ label }}</slot>
  </kbd>
</template>
