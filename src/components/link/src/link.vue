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
  if (!href)
    return false

  const currentUrl = window.location.origin + window.location.pathname

  if (external === 'auto') {
    if (['/', '#'].includes(href[0])) {
      return false
    }

    return !href.startsWith(currentUrl)
  }

  return external
})
</script>

<template>
  <RouterLink
    :to="href"
    rel="noopener"
    :target="isExternal ? '_blank' : undefined"
    class="pxd-link inline-flex items-center font-medium underline-offset-2 hover:underline"
    :class="{ underline }"
  >
    <slot />
    <ExternalLinkIcon v-if="isExternal" class="text-lg" />
  </RouterLink>
</template>
