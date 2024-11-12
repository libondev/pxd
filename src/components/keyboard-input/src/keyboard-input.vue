<script setup lang="ts">
import { shadowBorder } from '@/_utils/style.js'

interface KeyboardInputProps {
  meta?: boolean
  shift?: boolean
  alt?: boolean
  ctrl?: boolean
  small?: boolean
  label?: string
}

defineOptions({
  name: 'PKeyboardInput',
})

const props = defineProps<KeyboardInputProps>()

const INTERNAL_KEYS = {
  meta: '⌘',
  shift: '⇧',
  alt: '⌥',
  ctrl: '⌃',
}

const internalKey = computed(() => {
  return Object.entries(INTERNAL_KEYS).filter(([k]) => props[k]).map(([,v]) => v).join('')
})
</script>

<template>
  <kbd
    class="pxd-keyboard-input inline-flex px-1.5 items-center bg-background-100 text-gray-1000 text-center rounded font-sans ml-1"
    :class="[shadowBorder, small ? 'h-5 text-xs' : 'h-6 text-sm']"
  >
    {{ internalKey }}
    <slot>{{ label }}</slot>
  </kbd>
</template>
