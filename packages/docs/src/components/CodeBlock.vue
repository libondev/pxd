<script lang="ts" setup>
import { useCopyClick } from 'pxd/composables/useCopyClick'

const { renderAs, onCopyClick } = useCopyClick()

function onCopy(ev: MouseEvent) {
  const code = (ev.target as HTMLElement).parentNode?.textContent

  onCopyClick(code ?? '')
}
</script>

<template>
  <div class="code-block mt-4 w-full max-w-full rounded-lg border">
    <div class="p-6 overflow-x-auto">
      <slot />
    </div>

    <details class="group/code-block">
      <summary
        class="px-4 h-12 text-sm z-1 -mx-px -mb-px flex cursor-pointer items-center rounded-b-lg border bg-background-200 text-gray-900 self-focus-ring outline-none select-none group-open/code-block:top-12 group-open/code-block:sticky group-open/code-block:rounded-none"
      >
        <IconChevronRight class="text-xs mr-2 group-open/code-block:rotate-90 motion-safe:transition-transform" />

        <span
          data-open="Show code"
          data-close="Hide code"
          class="text-sm before:content-[attr(data-open)] group-open/code-block:before:content-[attr(data-close)]"
        />
      </summary>

      <div class="group relative overflow-auto rounded-b-lg border-t bg-(--color-bg-code-block)">
        <div class="max-h-100 overflow-auto">
          <slot name="code" />
        </div>

        <div
          class="top-3 right-4 p-2 absolute hidden cursor-pointer rounded-md bg-background-100 group-hover:block hover:bg-background-hover active:bg-background-active"
          @click="onCopy"
        >
          <Transition name="pxd-transition--fade-scale" mode="out-in">
            <component :is="renderAs" class="text-sm text-foreground-secondary" />
          </Transition>
        </div>
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
