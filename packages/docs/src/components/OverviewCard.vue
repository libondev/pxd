<script setup lang="ts">
const props = defineProps<{
  name: string
  title: string
}>()

function getPath() {
  return `/components/${props.name}`
}
</script>

<template>
  <RouterLink
    :to="getPath()"
    class="pxd-link-button w-full cursor-pointer overflow-hidden rounded-lg border no-underline! not-hover:transition-none hover:bg-background-200 motion-safe:transition-colors"
  >
    <div class="px-4 py-2 truncate border-b border-dashed">
      {{ title }}
    </div>

    <div class="p-4">
      <PText truncate="2" secondary>
        <slot />
      </PText>
    </div>
  </RouterLink>
</template>
