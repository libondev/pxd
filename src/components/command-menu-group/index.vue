<script lang="ts" setup>
import type { ComponentLabel } from '../../types/shared/props'

interface Props {
  label?: ComponentLabel
}

defineOptions({
  name: 'PCommandMenuGroup',
})

defineProps<Props>()
</script>

<template>
  <div class="pxd-command-menu-group" role="presentation">
    <div
      aria-hidden="true"
      class="h-10 px-2 flex items-center text-13px text-foreground-secondary only:hidden empty:hidden"
    >
      {{ label }}
    </div>

    <slot />
  </div>
</template>
