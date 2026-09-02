<script lang="ts" setup>
import type { ReasoningProps } from './types'
import BrainIcon from '@gdsicon/vue/brain'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { shallowRef, watch } from 'vue'
import { useCollapseMotion } from '../../composables/_internal/use-collapse-motion.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PShimmerText from '../shimmer-text/index.vue'

defineOptions({
  name: 'PReasoning',
  inheritAttrs: false,
})

const props = defineProps<ReasoningProps>()

const isOpen = shallowRef(!!props.streaming)

const configProvider = useConfigProvider()
const { contentRef, detailsOpen, isLeaving, skipEnterMotion } = useCollapseMotion(isOpen)

function onToggleClick() {
  isOpen.value = !isOpen.value
}

function onDetailsToggle(ev: Event) {
  const details = ev.currentTarget as HTMLDetailsElement

  if (details.open && !isOpen.value) {
    skipEnterMotion()
    isOpen.value = true
  }
}

watch(
  () => props.streaming,
  (streaming) => {
    isOpen.value = !!streaming
  },
)
</script>

<template>
  <details
    class="pxd-reasoning w-full max-w-full"
    v-bind="$attrs"
    :open="detailsOpen"
    @toggle="onDetailsToggle"
  >
    <summary
      class="pxd-reasoning--trigger group gap-1.5 text-sm flex w-max cursor-pointer touch-manipulation list-none appearance-none items-center text-foreground-secondary self-focus-ring outline-none select-none hover:text-foreground motion-safe:transition-colors"
      @click.prevent="onToggleClick"
    >
      <BrainIcon class="text-xs shrink-0" />

      <PShimmerText class="pxd-reasoning--title" :disabled="!streaming">
        {{ configProvider.locale.reasoning[streaming ? 'thinking' : 'thought'] }}
      </PShimmerText>

      <ChevronRightIcon
        class="text-xs shrink-0 opacity-0 group-hover:opacity-100 motion-safe:transition-transform-opacity"
        :class="{ 'rotate-90 opacity-100': isOpen }"
      />
    </summary>

    <div
      ref="contentRef"
      class="pxd-reasoning--content mbs-1.5 text-sm ms-1.5 ps-3 overflow-hidden border-l text-foreground-secondary"
      :class="{ 'motion-safe:transition-[height]': isOpen || isLeaving }"
    >
      <slot />
    </div>
  </details>
</template>
