<script lang="ts" setup>
import type { ReasoningProps } from './types'
import BrainIcon from '@gdsicon/vue/brain'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { shallowRef } from 'vue'
import { useDetailsCollapse } from '../../composables/_internal/use-details-collapse.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PShimmerText from '../shimmer-text/index.vue'

defineOptions({
  name: 'PReasoning',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ReasoningProps>(), {
  variant: 'default',
  streaming: true,
})

const contentRef = shallowRef<HTMLElement>()

const configProvider = useConfigProvider()
const { isOpen, detailsOpen, isLeaving, onToggleClick, onDetailsToggle } = useDetailsCollapse(
  contentRef,
  () => props.streaming,
)
</script>

<template>
  <details
    data-reasoning
    class="pxd-reasoning w-full max-w-full"
    :class="{ 'rounded-xl border bg-background-100': variant === 'default' }"
    v-bind="$attrs"
    :open="detailsOpen"
    @toggle="onDetailsToggle"
  >
    <summary
      class="pxd-reasoning--trigger group gap-2 text-sm flex w-full cursor-pointer touch-manipulation list-none appearance-none items-center self-focus-ring outline-none select-none"
      :class="{
        'p-3 font-medium text-foreground': variant === 'default',
        'text-foreground-secondary hover:text-foreground motion-safe:transition-colors':
          variant === 'simple',
      }"
      @click.prevent="onToggleClick"
    >
      <BrainIcon class="size-3 shrink-0" />

      <PShimmerText class="pxd-reasoning--title" :disabled="!streaming">
        {{ configProvider.locale.reasoning[streaming ? 'thinking' : 'thought'] }}
      </PShimmerText>

      <ChevronRightIcon
        class="size-3 shrink-0 text-foreground-secondary motion-safe:transition-transform-opacity"
        :class="{
          'rotate-90 opacity-100': isOpen,
          'ml-auto': variant === 'default',
          'opacity-0 group-hover:opacity-100': variant === 'simple',
        }"
      />
    </summary>

    <div
      ref="contentRef"
      class="pxd-reasoning--content overflow-hidden"
      :class="{
        'p-3 text-sm border-t text-foreground-secondary': variant === 'default',
        'mbs-1.5 text-sm ms-1.5 ps-3 border-l text-foreground-secondary': variant === 'simple',
        'motion-safe:transition-[height]': isOpen || isLeaving,
      }"
    >
      <slot />
    </div>
  </details>
</template>
