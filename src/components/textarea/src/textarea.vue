<script lang="ts" setup>
defineOptions({
  name: 'PTextarea',
})

const inputText = defineModel<string>()
</script>

<template>
  <textarea
    v-model="inputText"
    class="flex min-h-20 w-full h-8 rounded px-3 py-2 shadow-sm box-border bg-background rounded-md b-(1 solid input) py-2 text-sm text-inherit font-inherit placeholder:(text-gray/500) disabled:(cursor-not-allowed b-transparent bg-secondary)"
  />
</template>
