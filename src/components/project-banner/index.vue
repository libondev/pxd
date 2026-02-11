<script lang="ts" setup>
import type { ProjectBannerProps } from './types'
import { computed } from 'vue'
import { tv } from 'tailwind-variants'

defineOptions({
  name: 'PProjectBanner',
  inheritAttrs: false,
})

const props = defineProps<ProjectBannerProps>()

const projectBannerVariant = tv({
  slots: {
    base: 'gap-x-2 py-2 leading-5 min-h-10 text-sm z-30 flex w-full -translate-y-px items-center justify-center border-y',
    action:
      'ml-6 md:ml-0 font-medium cursor-pointer underline underline-offset-3 motion-safe:transition-colors',
  },
  variants: {
    variant: {
      warning: {
        base: 'border-amber-400 bg-amber-100 text-amber-900',
        action: 'text-amber-1000 decoration-amber-400 hover:border-amber-500 hover:text-amber-900',
      },
      success: {
        base: 'border-green-400 bg-green-100 text-green-900',
        action: 'text-green-1000 decoration-green-400 hover:border-green-500 hover:text-green-900',
      },
      error: {
        base: 'border-red-400 bg-red-100 text-red-900',
        action: 'text-red-1000 decoration-red-400 hover:border-red-500 hover:text-red-900',
      },
      info: {
        base: 'border-blue-400 bg-blue-100 text-blue-900',
        action: 'text-blue-1000 decoration-blue-400 hover:border-blue-500 hover:text-blue-900',
      },
    },
  },
})

const computedClasses = computed(() => projectBannerVariant({ variant: props.variant }))
</script>

<template>
  <aside :class="computedClasses.base()" v-bind="$attrs">
    <div class="gap-2 px-6 md:justify-center md:flex-row md:items-center flex w-full flex-col">
      <div class="gap-2 flex items-center">
        <div v-if="$slots.icon" aria-hidden="true" class="shrink-0">
          <slot name="icon"></slot>
        </div>

        <p class="my-0!">
          <slot>{{ label }}</slot>
        </p>
      </div>

      <div v-if="$slots.action" :class="computedClasses.action()">
        <slot name="action"></slot>
      </div>
    </div>
  </aside>
</template>
