<script lang="ts" setup>
import { inputBorder } from '../index'

interface InputProps {
  error?: string
  readonly?: boolean
  disabled?: boolean
}

defineOptions({
  name: 'PInput',
})

defineProps<InputProps>()

const randomId = useId()
</script>

<template>
  <div class="pxd-input">
    <div
      class="inline-flex items-center justify-center h-8 rounded-md transition-shadow"
      :class="[inputBorder.base, error ? inputBorder.error : inputBorder.default]"
      :data-disabled="disabled"
    >
      <label v-if="$slots.prefix" :for="randomId" class="px-3 text-sm text-gray-700">
        <slot name="prefix" />
      </label>

      <input
        :id="randomId"
        class="
          rounded-md h-full px-3 w-full font-inherit bg-background-100 text-sm placeholder:text-gray-500
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:placeholder:opacity-0 outline-none
          file:border-0 file:bg-transparent file:text-sm file:font-medium
        "
        :readonly="readonly"
        :disabled="disabled"
        v-bind="$attrs"
      >

      <label v-if="$slots.suffix" :for="randomId" class="px-3 text-sm text-gray-700">
        <slot name="suffix" />
      </label>
    </div>

    <PError v-if="error" class="mt-1.5">
      {{ error }}
    </PError>
  </div>
</template>
