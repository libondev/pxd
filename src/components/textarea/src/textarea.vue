<script lang="ts" setup>
import { inputBorder } from '@/components/input/index'

interface TextareaProps {
  error?: string
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
      class="flex w-full h-8 min-h-24 rounded px-3 py-2 outline-0 bg-background-100 rounded-md text-sm text-inherit font-inherit transition-shadow placeholder:text-gray-700 disabled:bg-gray-100"
      :class="[inputBorder.base, error ? inputBorder.error : inputBorder.default]"
    />
    <PError v-if="error" class="mt-1.5">
      {{ error }}
    </PError>
  </div>
</template>
