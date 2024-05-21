<script lang="ts" setup>
defineOptions({
  name: 'PTextarea',
})

defineProps({
  size: {
    type: String as PropType<Size>,
    default: 'default',
  },
})

const inputText = defineModel<string>()
</script>

<template>
  <textarea
    v-model="inputText"
    class="flex min-h-20 w-full shadow-sm box-border bg-background rounded-md b-(1 solid input) py-2 text-sm text-inherit font-inherit placeholder:(text-gray/500) outlines disabled:(cursor-not-allowed b-transparent bg-secondary)"
    :class="getSize(size)"
  />
</template>
