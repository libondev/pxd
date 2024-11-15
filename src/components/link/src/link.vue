<script setup lang="ts">
import { ExternalLinkIcon } from '@radix-icons/vue'

interface LinkProps {
  href: string
  external?: boolean | string
  underline?: boolean
}

const {
  href,
  external = 'auto',
} = defineProps<LinkProps>()

const isExternal = computed(() => {
  const currentUrl = window.location.origin + window.location.pathname

  if (external === 'auto') {
    return !href.startsWith(currentUrl)
  }

  return external
})
</script>

<template>
  <a
    :href="href"
    rel="noopener"
    :target="isExternal ? '_blank' : undefined"
    class="pxd-link inline-flex items-center font-medium underline-offset-2 hover:underline"
    :class="{ underline }"
  >
    <slot />
    <ExternalLinkIcon v-if="isExternal" class="text-lg" />
  </a>
</template>
