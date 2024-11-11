<script lang="ts" setup>
import { SwitchRoot, SwitchThumb } from 'radix-vue'

defineOptions({
  name: 'PSwitch',
})

withDefaults(
  defineProps<SwitchProps>(),
  {
    size: 'default',
    activeText: 'checked',
    inactiveText: 'unchecked',
    activeValue: 'checked',
    inactiveValue: 'unchecked',
  },
)

interface SwitchProps {
  size?: keyof typeof SIZES
  disabled?: boolean
  activeText?: string
  inactiveText?: string
  activeValue?: any
  inactiveValue?: any
}

const SIZES = {
  small: 'h-8',
  default: 'h-10',
  large: 'h-12',
}

const checkState = defineModel<SwitchProps['activeValue'] | SwitchProps['inactiveValue']>()
</script>

<template>
  <div class="pxd-switch inline-flex items-center p-1 h-10 rounded-md shadow-[0_0_0_1px_var(--p-gray-alpha-400)]" :class="SIZES[size]">
    <label class="pxd-switch--item group h-full font-medium">
      <input v-model="checkState" :disabled="disabled" class="peer sr-only" type="radio" name="default" :value="activeValue">
      <slot name="active">
        <div class="px-3 h-full flex items-center text-gray-900 rounded transition-colors peer-enabled-checked:text-gray-1000 peer-enabled:hover:text-gray-1000 group-hover-enabled:text-gray-1000 peer-checked:bg-gray-100 peer-enabled:cursor-pointer peer-disabled:cursor-not-allowed">{{ activeText }}</div>
      </slot>
    </label>
    <label class="pxd-switch--item group h-full font-medium">
      <input v-model="checkState" :disabled="disabled" class="peer sr-only" type="radio" name="default" :value="inactiveValue">
      <slot name="inactive">
        <div class="px-3 h-full flex items-center text-gray-900 rounded transition-colors peer-enabled-checked:text-gray-1000 peer-enabled:hover:text-gray-1000 group-hover-enabled:text-gray-1000 peer-checked:bg-gray-100 peer-enabled:cursor-pointer peer-disabled:cursor-not-allowed">{{ inactiveText }}</div>
      </slot>
    </label>
  </div>
</template>
