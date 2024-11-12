<script lang="ts" setup>
import { focusVisibleRing } from '@/_utils/style.js'
import { Icon } from '@iconify/vue'
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
      :class="focusVisibleRing"
      v-bind="$attrs"
    >
      <CheckboxIndicator as-child class="block h-full p-px -m-px">
        <Icon icon="carbon:checkmark" class="text-background-100" />
      </CheckboxIndicator>
    </CheckboxRoot>

    <span class="pl-1 pr-1.5 leading-0 active:select-none text-sm text-gray-1000 empty:hidden peer-disabled:text-gray-500">
      <slot />
    </span>
  </label>
</template>
