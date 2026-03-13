<script lang="ts" setup>
import type { EmptyStateProps } from './types'

defineOptions({
  name: 'PEmptyState',
  inheritAttrs: false,
})

defineProps<EmptyStateProps>()
</script>

<template>
  <div
    class="pxd-empty-state py-12 px-18 w-full rounded-lg border bg-background-100"
    v-bind="$attrs"
  >
    <div class="max-w-sm space-y-6 mx-auto flex flex-col">
      <template v-if="$slots.icon">
        <div
          class="pxd-empty-state--icon p-3.5 size-15 mx-auto flex items-center justify-center rounded-md border text-foreground-secondary"
        >
          <slot name="icon" />
        </div>
      </template>

      <div class="pxd-empty-state--content gap-2 flex flex-col">
        <p class="pxd-empty-state--title text-base font-medium text-center text-foreground">
          <slot name="title">
            {{ title }}
          </slot>
        </p>

        <p class="pxd-empty-state--description text-sm text-center text-foreground-secondary">
          <slot name="description">
            {{ description }}
          </slot>
        </p>
      </div>

      <slot />
    </div>
  </div>
</template>
