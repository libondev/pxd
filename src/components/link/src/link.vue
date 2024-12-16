<script setup lang="ts">
import { ExternalIcon } from 'gdsi/vue'

interface LinkProps {
  href: string
  withIcon?: boolean
  external?: boolean | string
  underline?: boolean
  hoverUnderline?: boolean
}

const {
  href,
  external,
  withIcon = true,
  hoverUnderline = true,
} = defineProps<LinkProps>()

const attrs = computed(() => {
  if (external) {
    return {
      href,
      rel: 'noopener',
      target: '_blank',
    }
  }

  return {
    to: href,
  }
})
</script>

<template>
  <Component
    :is="external ? 'a' : 'RouterLink'"
    v-bind="attrs"
    class="pxd-link p-ring inline-flex items-center font-medium"
    :class="{ 'underline underline-offset-2': underline, 'hover:underline': hoverUnderline }"
  >
    <slot />
    <ExternalIcon v-if="withIcon && external" class="text-lg" />
  </component>
</template>
