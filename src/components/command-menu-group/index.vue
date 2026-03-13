<script lang="ts" setup>
import type { CommandMenuGroupProps } from './types'

defineOptions({
  name: 'PCommandMenuGroup',
  inheritAttrs: false,
})

defineProps<CommandMenuGroupProps>()
</script>

<template>
  <div class="pxd-command-menu-group" role="presentation" v-bind="$attrs">
    <div
      aria-hidden="true"
      class="h-10 px-2 flex items-center text-13px text-foreground-secondary only:hidden empty:hidden"
    >
      {{ label }}
    </div>

    <slot />
  </div>
</template>
