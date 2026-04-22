<script lang="ts" setup>
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
    class="pxd-link-button w-full cursor-pointer overflow-hidden rounded-lg border no-underline! self-focus-ring outline-none hover:bg-background-hover active:bg-background-active motion-safe:transition-colors"
  >
    <div class="px-4 py-2 truncate border-b border-dashed text-15px">
      {{ title }}
    </div>

    <div class="p-4">
      <PText truncate="2" secondary>
        <slot />
      </PText>
    </div>
  </RouterLink>
</template>
