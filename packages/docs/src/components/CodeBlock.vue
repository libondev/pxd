<script lang="ts" setup>
import CheckIcon from '@gdsicon/vue/check'
import CopyIcon from '@gdsicon/vue/copy'

const isSuccessful = shallowRef(false)

let copyTimeoutId: ReturnType<typeof setTimeout>

async function onCopyClick(ev: MouseEvent) {
  const code = (ev.target as HTMLElement).parentNode?.textContent

  if (code) {
    clearTimeout(copyTimeoutId)
    await navigator.clipboard.writeText(code)
    isSuccessful.value = true
    copyTimeoutId = setTimeout(() => {
      isSuccessful.value = false
    }, 2000)
  }
}
</script>

<template>
  <div class="code-block border w-full max-w-full rounded-lg mt-4">
    <div class="p-6 overflow-x-auto">
      <slot />
    </div>

    <details class="group/code-block">
      <summary
        class="flex items-center px-4 h-11 border-t text-sm text-gray-900 select-none cursor-pointer outline-none self-focus-ring rounded-bl-lg rounded-br-lg bg-background-secondary group-open/code-block:rounded-none group-open/code-block:sticky group-open/code-block:top-12 z-1"
      >
        <IconChevronRight class="text-xs mr-2 group-open/code-block:rotate-90 motion-safe:transition-transform" />

        <span
          data-open="Show"
          data-close="Hide"
          class="before:content-[attr(data-open)] group-open/code-block:before:content-[attr(data-close)] text-sm"
        > code</span>
      </summary>

      <div class="relative group border-t rounded-bl-lg rounded-br-lg overflow-auto bg-(--color-bg-code-block)">
        <div class="overflow-auto max-h-100">
          <slot name="code" />
        </div>

        <div class="absolute hidden group-hover:block top-4 right-4 p-2 rounded-md cursor-pointer bg-background hover:bg-background-hover active:bg-background-active" @click="onCopyClick">
          <component :is="isSuccessful ? CheckIcon : CopyIcon" class="pointer-events-none" />
        </div>
      </div>
    </details>
  </div>
</template>
