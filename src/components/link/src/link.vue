<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface LinkProps {
  href: string
  external?: boolean | string
  underline?: boolean
}

const props = withDefaults(
  defineProps<LinkProps>(),
  {
    external: 'auto',
  },
)

const isExternal = computed(() => {
  const currentUrl = window.location.origin + window.location.pathname

  if (props.external === 'auto') {
    return !props.href.startsWith(currentUrl)
  }

  return props.external
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
    <Icon v-if="isExternal" icon="carbon:launch" class="text-lg" />
  </a>
</template>
