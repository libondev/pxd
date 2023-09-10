<script lang="ts" setup>
import { SwitchRoot, SwitchThumb } from 'radix-vue'

defineOptions({
  name: 'PxSwitch'
})

const SIZES = {
  sm: {
    track: 'w-36px h-20px',
    inner: 'w-4 h-4'
  },
  default: {
    track: 'w-44px h-24px',
    inner: 'w-5 h-5'
  },
  lg: {
    track: 'w-52px h-28px',
    inner: 'w-6 h-6'
  }
}

defineProps({
  size: {
    type: String as PropType<keyof typeof SIZES>,
    default: 'default'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const checkState = defineModel<boolean>()
</script>

<template>
  <SwitchRoot
    v-model:checked="checkState"
    :disabled="disabled"
    class="pxd-switch shadow-sm b-0 p-2px rounded-full transition outlines bg-input cursor-default data-[state=checked]:bg-primary disabled:(op-50 cursor-not-allowed)"
    :class="SIZES[size].track"
  >
    <SwitchThumb
      class="pxd-switch--inner block bg-background shadow-sm rounded-full transition-transform hover:will-change-transform data-[state=checked]:translate-x-full"
      :class="SIZES[size].inner"
    />
  </SwitchRoot>
</template>
