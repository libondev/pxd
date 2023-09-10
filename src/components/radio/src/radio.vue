<script lang="ts" setup>
import {
  RadioGroupRoot,
  RadioGroupItem,
} from 'radix-vue'
import { PropType } from 'vue';

defineOptions({
  name: 'PxRadio'
})

interface OptionItem {
  label: string
  value: string
  disabled?: boolean
}

const SIZES = {
  sm: 'h-5 px-2 rounded-md',
  default: 'h-6.5 px-2.5',
  lg: 'h-8 px-4 rounded-md'
}

defineProps({
  variant: {
    type: String as PropType<'default' | 'button'>,
    default: 'default'
  },
  size: {
    type: String as PropType<keyof typeof SIZES>,
    default: 'default'
  },
  defaultValue: {
    type: String,
    default: ''
  },
  vertical: {
    type: Boolean,
    default: false
  },
  options: {
    type: Array as PropType<OptionItem[]>,
    default: () => []
  }
})

const checkState = defineModel<string>()

const classNames = {
  default: 'w-4 h-4 rounded-full p-0 before:(content-empty block w-full h-full rounded-full pointer-events-none bg-transparent) data-[state=checked]:(b-primary p-.75 before:bg-primary)',
  button: 'rounded data-[state=checked]:(b-primary bg-primary text-background) disabled:(op-50 bg-secondary)',
}
</script>

<template>
  <RadioGroupRoot
    v-model="checkState"
    :aria-label="$attrs.name"
    :default-value="defaultValue"
    :orientation="vertical ? 'vertical' :'horizontal'"
    class="flex gap-2 data-[orientation=vertical]:(flex-col)"
  >
    <label
      v-for="option, index of options"
      :key="option.value + index"
      class="inline-flex items-center"
     >
      <RadioGroupItem
        class="b-(1 solid input) outlines shadow-sm text-inherit font-inherit cursor-default bg-background leading-none"
        :class="[classNames[variant], variant === 'button' && SIZES[size]]"
        :value="option.value"
        :title="option.label"
        :disabled="option.disabled"
      >
        <slot v-if="variant === 'button'" v-bind="option">
          {{ option.label }}
        </slot>
      </RadioGroupItem>

      <span v-if="variant === 'default'" class="pl-1.5 active:select-none">
        <slot v-bind="option">{{ option.label }}</slot>
      </span>
    </label>
  </RadioGroupRoot>
</template>
