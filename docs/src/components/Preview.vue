<script setup lang="ts">
import { ChevronRightIcon } from 'gdsi/vue'

defineProps<{
  code: string
  slotClass?: string
}>()
</script>

<template>
  <div class="preview-block w-full bg-background-100 rounded-lg border">
    <div :class="slotClass" class="w-full p-6">
      <slot />
    </div>

    <details class="overflow-hidden">
      <!-- 隐藏 marker -->
      <summary
        data-open="Show Code"
        data-close="Hide Code"
        class="flex items-center h-12 border-t border-b border-b-transparent gap-3 select-none px-4 text-sm text-gray-900 cursor-pointer bg-background-200 [&::-webkit-details-marker]:hidden"
      >
        <ChevronRightIcon class="transition-transform" />
      </summary>

      <div class="p-6">
        <PCodeBlock :code="code" language="vue" class="min-h-14" />
      </div>
    </details>
  </div>
</template>

<style lang="scss">
.preview-block details {
  border-radius: 0 0 var(--radius) var(--radius);

  summary::after {
    content: attr(data-open);
  }

  &[open] summary {
    border-bottom-color: hsl(var(--gray-200-value));

    &::after {
      content: attr(data-close);
    }

    svg {
      transform: rotate(90deg);
    }
  }
}
</style>
