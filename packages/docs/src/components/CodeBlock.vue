<script lang="ts" setup>
function getCopyText(ev: PointerEvent) {
  const code = (ev.target as HTMLElement).parentNode?.textContent

  return code!
}
</script>

<template>
  <div class="code-block mbs-4 w-full max-w-full rounded-lg border">
    <div class="p-6 overflow-x-auto">
      <slot />
    </div>

    <details class="group/code-block">
      <summary
        class="px-4 h-12 text-sm group-open/code-block:top-12 z-2 -mx-px -mbe-px flex cursor-pointer items-center rounded-b-lg border bg-background-200 text-gray-900 self-focus-ring outline-none select-none group-open/code-block:sticky group-open/code-block:rounded-none"
      >
        <IconChevronRight
          class="text-xs me-2 group-open/code-block:rotate-90 motion-safe:transition-transform"
        />

        <span
          data-open="Show code"
          data-close="Hide code"
          class="text-sm before:content-[attr(data-open)] group-open/code-block:before:content-[attr(data-close)]"
        />
      </summary>

      <div class="group relative overflow-auto rounded-b-lg border-t bg-(--color-bg-code-block)">
        <div class="max-h-100 overflow-auto content-visibility-auto intrinsic-size-auto">
          <slot name="code" />
        </div>

        <PCopyButton
          class="top-3 right-4 absolute active:scale-95"
          icon
          size="sm"
          :text="getCopyText"
        />
      </div>
    </details>
  </div>
</template>

<style>
.code-block pre.shiki {
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  white-space: pre !important;
  word-break: unset !important;
}
</style>
