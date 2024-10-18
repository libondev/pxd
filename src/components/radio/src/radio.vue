<script lang="ts" setup>
import type { Options } from '@/types'
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from 'radix-vue'

interface RadioOptions extends Options {
}

interface RadioProps {
  direction?: 'horizontal' | 'vertical'
  options?: RadioOptions[]
}

withDefaults(
  defineProps<RadioProps>(),
  {
    direction: 'horizontal',
    value: 'default',
  },
)

const checkState = defineModel<string>()
</script>

<template>
  <RadioGroupRoot
    v-model="checkState"
    :orientation="direction"
    class="pxd-radio flex gap-2 data-[orientation=vertical]:flex-col text-gray-1000"
  >
    <label v-for="option in options" :key="option.value" class="group inline-flex items-center">
      <RadioGroupItem
        :value="option.value"
        class="
          relative w-4 h-4 rounded-full bg-background-100 border border-gray-700 transition-colors cursor-pointer
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-500 disabled:text-gray-600
          group-hover:[&:not(:disabled,[data-state=checked])]:bg-gray-200 group-hover:[&:not(:disabled,[data-state=checked])]:border-gray-700
        "
      >
        <RadioGroupIndicator
          class="absolute inset-0 m-auto w-1/2 h-1/2 rounded-full bg-background-100 data-[state=checked]:bg-current"
        />
      </RadioGroupItem>

      <span class="pl-1 pr-1.5 leading-0 active:select-none text-sm text-gray-1000 empty:hidden peer-disabled:text-gray-500">{{ option.label }}</span>
    </label>
  </RadioGroupRoot>
</template>
