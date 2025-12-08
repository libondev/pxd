<script lang="ts" setup>
import CheckIcon from '@gdsicon/vue/check'
import CopyIcon from '@gdsicon/vue/copy'
import { useCopyClick } from 'pxd/composables/use-copy-click'

const { isCopied, copyText } = useCopyClick()

function onCopy(ev: MouseEvent) {
  const code = (ev.target as HTMLElement).parentNode?.textContent

  copyText(code ?? '')
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

        <PButton
          class="top-3 right-4 absolute hidden group-hover:flex active:scale-95"
          icon
          size="sm"
          @click="onCopy"
        >
          <div
            class="inset-0 ease-in-out absolute flex items-center justify-center transition-all duration-300 will-change-[transform,opacity,filter]"
            :class="isCopied ? 'blur-0 scale-100 opacity-100' : 'blur-xs scale-[0.25] opacity-0'"
          >
            <CheckIcon />
          </div>
          <div
            class="transition-[transform, opacity, filter] ease-in-out duration-300 will-change-[transform,opacity,filter]"
            :class="isCopied ? 'blur-xs scale-[0.25] opacity-0' : 'blur-0 scale-100 opacity-100'"
          >
            <CopyIcon />
          </div>
        </PButton>
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
