<script lang="ts" setup>
import Error from '#/components/error/index.js'

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
      class="p-focusable p-input w-full min-h-24 px-3 py-2 rounded-md text-sm"
      :class="{ 'p-focusable-error': error, 'resize-none': !resize }"
    />
    <Error v-if="error" class="mt-1.5" :error="error" />
  </div>
</template>
