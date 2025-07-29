<script lang="ts" setup>
import { useCopyClick } from 'pxd/composables'

const { renderAs, onCopyClick } = useCopyClick()
</script>

<template>
  <div class="code-block border w-full max-w-full rounded-lg mt-4">
    <div class="p-6 overflow-x-auto">
      <slot />
    </div>

    <details class="group/code-block">
      <summary
        class="flex items-center px-4 h-12 border -mb-px -mx-px text-sm text-gray-900 select-none cursor-pointer outline-none self-focus-ring rounded-bl-lg rounded-br-lg bg-background-secondary group-open/code-block:rounded-none group-open/code-block:sticky group-open/code-block:top-12 z-1"
      >
        <IconChevronRight class="text-xs mr-2 group-open/code-block:rotate-90 motion-safe:transition-transform" />

        <span
          data-open="Show code"
          data-close="Hide code"
          class="before:content-[attr(data-open)] group-open/code-block:before:content-[attr(data-close)] text-sm"
        />
      </summary>

      <div class="relative group border-t rounded-bl-lg rounded-br-lg overflow-auto bg-(--color-bg-code-block)">
        <div class="overflow-auto max-h-100">
          <slot name="code" />
        </div>

        <div class="absolute hidden group-hover:block top-3 right-4 p-2 rounded-md cursor-pointer bg-background hover:bg-background-hover active:bg-background-active" @click="onCopyClick">
          <Transition name="pxd-transition--fade-scale" mode="out-in">
            <component :is="renderAs" class="text-sm text-foreground-secondary" />
          </Transition>
        </div>
      </div>
    </details>
  </div>
</template>
