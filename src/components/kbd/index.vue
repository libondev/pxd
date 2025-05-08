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
    class="pxd-keyboard-input border border-input inline-flex px-1.5 items-center bg-background text-gray-1000 text-center rounded-md font-sans ml-1"
    :class="[small ? 'h-5 text-xs' : 'h-6 text-sm']"
  >
    {{ internalKey }}
    <slot>{{ label }}</slot>
  </kbd>
</template>
