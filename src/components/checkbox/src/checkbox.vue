<script lang="ts" setup>
import { CheckboxIndicator, CheckboxRoot } from 'radix-vue'

interface CheckboxProps {
}

defineOptions({
  name: 'PCheckbox',
})

defineProps<CheckboxProps>()

const checkState = defineModel<boolean>()
</script>

<template>
  <label class="pxd-checkbox group inline-flex items-center cursor-pointer text-gray-1000">
    <CheckboxRoot
      v-model:checked="checkState"
      class="
        peer w-4 h-4 p-0 shadow-sm rounded border border-gray-700 transition-colors
        bg-background-100 data-[state=checked]:bg-current data-[state=checked]:!border-current
        disabled:cursor-not-allowed disabled:bg-gray-100 disabled:border-gray-500 disabled:text-gray-600
        group-hover:[&:not(:disabled,[data-state=checked])]:bg-gray-200 group-hover:[&:not(:disabled,[data-state=checked])]:border-gray-700
      "
      v-bind="$attrs"
    >
      <CheckboxIndicator as-child class="block h-full p-px -m-px">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
          <path fill="none" stroke="var(--p-background-100)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="translate-y-[2px]" d="M28 7L13 22L5 14" />
        </svg>
      </CheckboxIndicator>
    </CheckboxRoot>

    <span class="pl-1 pr-1.5 leading-0 active:select-none text-sm text-gray-1000 empty:hidden peer-disabled:text-gray-500">
      <slot />
    </span>
  </label>
</template>
