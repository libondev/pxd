<script setup lang="ts">
import type { ButtonProps } from '../../types/components'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { computed } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import PButton from '../button/index.vue'

interface Props extends ButtonProps {
  moreText?: string
  lessText?: string
  modelValue?: boolean
}

defineOptions({
  name: 'PMoreButton',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    moreText: 'Show More',
    lessText: 'Show Less',
    modelValue: false,
    shape: 'rounded',
  },
)

const emits = defineEmits<{
  'update:modelValue': [NonNullable<Props['modelValue']>]
}>()

const isExpanded = useModelValue(props, emits)

const buttonProps = computed(() => {
  const { moreText, lessText, modelValue, ...rest } = props

  return rest
})

function onToggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="pxd-more-button w-full flex items-center px-4 mt-4">
    <PButton class="relative z-10" v-bind="buttonProps" @click="onToggleExpand">
      {{ isExpanded ? lessText : moreText }}

      <template #suffix>
        <ChevronDownIcon class="-ml-0.5 motion-safe:transition-transform motion-safe:duration-200" :class="{ 'rotate-180': isExpanded }" />
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
