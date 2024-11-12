<script lang="ts" setup>
import { SwitchRoot, SwitchThumb } from 'radix-vue'

interface ToggleProps {
  size?: keyof typeof SIZES
  disabled?: boolean
  activeText?: string
  inactiveText?: string
  activeColor?: string
  inactiveColor?: string
}

defineOptions({
  name: 'PToggle',
})

withDefaults(
  defineProps<ToggleProps>(),
  {
    size: 'default',
    activeColor: 'hsl(var(--blue-700-value))',
    inactiveColor: 'var(--background-200)',
  },
)

const SIZES = {
  small: 'w-[22px] h-3',
  default: 'w-[28px] h-[15px]',
  large: 'w-[34px] h-[18px]',
}

const checkState = defineModel<boolean>()
</script>

<template>
  <label class="pxd-toggle inline-flex items-center text-sm">
    <span v-if="activeText" class="pxd-toggle--text text-gray-900">{{ activeText }}</span>

    <SwitchRoot
      v-model:checked="checkState"
      :disabled="disabled"
      class="rounded-full transition cursor-default border border-gray-alpha-400 bg-[--inactive-color] enabled:data-[state=checked]:bg-[--active-color] disabled:bg-background-100 disabled:cursor-not-allowed"
      :class="SIZES[size]"
      :style="{ '--active-color': activeColor, '--inactive-color': inactiveColor }"
    >
      <SwitchThumb
        as="div"
        class="pxd-toggle--thumb relative aspect-square h-full bg-white shadow-sm rounded-full transition-transform data-[state=checked]:translate-x-full data-[disabled]:bg-gray-200"
        style="box-shadow:0 0 4px #0000001f,0 1px 1px #00000029"
      >
        <div class="absolute inset-0 flex items-center justify-center overflow-hidden">
          <slot :name="`${checkState ? 'active-icon' : 'inactive-icon'}`" />
        </div>
      </SwitchThumb>
    </SwitchRoot>
    <span v-if="inactiveText" class="pxd-toggle--text text-gray-900">{{ inactiveText }}</span>
  </label>
</template>
