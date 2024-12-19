<script lang="ts" setup>
import type { StandardError } from '#types'
import Error from '#/components/error/index.js'
import { getInputSizes, type InputSizes } from '../index.js'

interface InputProps {
  size?: InputSizes
  error?: StandardError
  readonly?: boolean
  disabled?: boolean
}

defineOptions({
  name: 'PInput',
})

const {
  size = 'default',
} = defineProps<InputProps>()

const randomId = useId()

const inputSize = computed(() => getInputSizes(size))
</script>

<template>
  <div class="pxd-input">
    <div
      class="p-focusable flex items-center justify-center rounded-md transition-shadow"
      :class="[{ 'p-focusable-error': error }, inputSize]"
      :data-disabled="disabled"
    >
      <label v-if="$slots.prefix" :for="randomId" class="px-3 text-sm text-gray-700">
        <slot name="prefix" />
      </label>

      <input
        :id="randomId"
        class="
          w-full h-full px-3 rounded-inherit text-sm p-input outline-none
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

    <Error v-if="error" class="mt-1.5" :error="error" />
  </div>
</template>
