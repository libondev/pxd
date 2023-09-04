<script lang="ts" setup>

defineOptions({
  name: 'PxTextarea',
  install(this: Component, app: App) {
    app.component(this.name, this)
  }
})

defineProps({
  size: {
    type: String as PropType<Sizes>,
    default: 'default'
  }
})

const inputText = defineModel<string>()
</script>

<template>
  <textarea
    v-model="inputText"
    class="flex min-h-20 w-full shadow-sm box-border bg-background rounded-md b-(1 solid input) py-2 text-sm text-inherit font-inherit placeholder:(text-gray/500) outlines disabled:(cursor-not-allowed b-transparent bg-secondary)"
    :class="getSizes(size)"
  />
</template>
