<script lang="ts" setup>
</script>

<template>
  <div class="code-block border w-full max-w-full rounded-lg mt-4">
    <div class="p-6 overflow-x-auto">
      <slot />
    </div>

    <details class="group/code-block">
      <summary
        class="flex items-center px-4 h-11 border-t text-sm text-gray-900 select-none cursor-pointer outline-none self-focus-ring rounded-bl-lg rounded-br-lg bg-background-secondary group-open/code-block:rounded-none"
      >
        <IconChevronRight class="text-xs mr-2 group-open/code-block:rotate-90 motion-safe:transition-transform" />

        <span
          data-open="Show"
          data-close="Hide"
          class="before:content-[attr(data-open)] group-open/code-block:before:content-[attr(data-close)] text-sm"
        > code</span>
      </summary>

      <div class="border-t rounded-bl-lg rounded-br-lg overflow-auto">
        <slot name="code" />
      </div>
    </details>
  </div>
</template>
