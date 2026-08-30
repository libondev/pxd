<script lang="ts" setup>
import type { MoreButtonEmits, MoreButtonProps } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { useModelValue } from '../../composables/_internal/use-model-value'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PMoreButton',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<MoreButtonProps>(), {
  moreText: 'Show More',
  lessText: 'Show Less',
  modelValue: false,
})

const emits = defineEmits<MoreButtonEmits>()

const isExpanded = useModelValue(props, emits)

function onToggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="pxd-more-button px-4 mbs-4 flex w-full items-center">
    <PButton class="relative z-1" shape="rounded" v-bind="$attrs" @click="onToggleExpand">
      {{ isExpanded ? lessText : moreText }}

      <template #suffix>
        <ChevronDownIcon
          class="-ms-0.5 motion-safe:transition-transform motion-safe:duration-200"
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
