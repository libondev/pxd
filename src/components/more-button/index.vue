<script lang="ts" setup>
import type { MoreButtonEmits, MoreButtonProps } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PMoreButton',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MoreButtonProps>(), {
  moreText: 'Show More',
  lessText: 'Show Less',
  modelValue: false,
})

const emits = defineEmits<MoreButtonEmits>()

const { modelValue: isExpanded, change } = useModelValue(props, emits)

useAgentNode({
  name: 'more-button',
  namedBy: 'button',
  state: () => ({ expanded: isExpanded.value }),
  actions: {
    setValue: (value) => {
      change(Boolean(value), { reason: 'api' })
    },
    toggle: () => {
      change(!isExpanded.value, { reason: 'api' })
    },
  },
})

function onToggleExpand() {
  change(!isExpanded.value, { reason: 'trigger-press' })
}
</script>

<template>
  <div data-more-button class="pxd-more-button px-4 mbs-4 flex w-full items-center">
    <PButton
      class="relative z-1"
      shape="rounded"
      :text="isExpanded ? lessText : moreText"
      v-bind="$attrs"
      @click="onToggleExpand"
    >
      <template #suffix>
        <ChevronDownIcon
          class="-ms-0.5 motion-safe:transition-transform"
          :class="{ 'rotate-180': isExpanded }"
        />
      </template>
    </PButton>
  </div>
</template>

<style>
.pxd-more-button::before,
.pxd-more-button::after {
  content: '';
  display: block;
  width: 100%;
  border-top: 1px solid var(--color-gray-alpha-300);
}
</style>
