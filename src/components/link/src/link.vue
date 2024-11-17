<script setup lang="ts">
import { ExternalLinkIcon } from '@radix-icons/vue'

interface LinkProps {
  href: string
  external?: boolean | string
  underline?: boolean
  hoverUnderline?: boolean
}

const { hoverUnderline = true } = defineProps<LinkProps>()
</script>

<template>
  <RouterLink
    :to="href"
    rel="noopener"
    :target="external ? '_blank' : undefined"
    class="pxd-link inline-flex items-center font-medium"
    :class="{ 'underline underline-offset-2': underline, 'hover:underline': hoverUnderline }"
  >
    <slot />
    <ExternalLinkIcon v-if="external" class="text-lg" />
  </RouterLink>
</template>
