<script lang="ts" setup>
import type { AvatarProps } from '..'
import { autoUnit } from '@utils/css-value'

defineOptions({
  name: 'PAvatar',
})

withDefaults(
  defineProps<AvatarProps>(),
  {
    size: 32,
    placeholder: false,
  },
)

defineEmits(['error'])
</script>

<template>
  <div
    class="
      pxd-avatar relative rounded-full border border-white select-none
      before:absolute before:inset-0 before:w-full before:h-full before:rounded-full before:bg-[length:400%_100%] before:animate-flash-loading before:bg-gradient-to-l
      after:absolute after:inset-0 after:w-full after:h-full after:rounded-full after:border after:border-gray-alpha-400
    "
    :style="{ 'width': autoUnit(size), 'height': autoUnit(size), '--tw-gradient-stops': 'var(--accents-1), var(--accents-2), var(--accents-2), var(--accents-1)' }"
  >
    <slot>
      <img
        v-if="!placeholder"
        :src="src"
        class="relative rounded-full text-0 overflow-hidden"
        :width="size"
        :height="size"
        alt="avatar"
        aria-hidden="true"
        @error="$emit('error', $event)"
      >
    </slot>

    <div
      v-if="$slots.badge"
      class="absolute bottom-[-5px] left-[-3px] z-10 w-1/2 h-1/2 flex items-center rounded-full border border-white bg-white overflow-hidden"
    >
      <slot name="badge" />
    </div>
  </div>
</template>
