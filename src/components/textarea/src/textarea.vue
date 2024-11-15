<script lang="ts" setup>
interface TextareaProps {
  error?: string
  resize?: boolean
  disabled?: boolean
  readonly?: boolean
}

defineOptions({
  name: 'PTextarea',
})

defineProps<TextareaProps>()

const inputText = defineModel<string>()
</script>

<template>
  <div class="pxd-textarea relative">
    <textarea
      v-model="inputText"
      v-bind="$attrs"
      :disabled="disabled"
      :readonly="readonly"
      :data-disabled="disabled"
      class="p-focusable w-full min-h-24 px-3 py-2 outline-0 bg-background-100 rounded-md text-sm text-inherit font-inherit transition-shadow placeholder:text-gray-700 disabled:bg-gray-100"
      :class="{ 'p-focusable-error': error, 'resize-none': !resize }"
    />
    <PError v-if="error" class="mt-1.5" :error="error" />
  </div>
</template>
