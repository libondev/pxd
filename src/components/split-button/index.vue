<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import type { SplitButtonProps, SplitButtonEmits } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { isNil } from 'es-toolkit'
import { useSlots, computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { collectVNodeProps } from '../../utils/vnode'
import PButton from '../button/index.vue'
import PMenu from '../menu/index.vue'

defineOptions({
  name: 'PSplitButton',
  inheritAttrs: false,
})

const props = defineProps<SplitButtonProps>()
const emits = defineEmits<SplitButtonEmits>()

const slots = useSlots()
const modelValue = useModelValue(props, emits)

const selectedItem = computed((): ListOptionSelected | undefined => {
  if (isNil(modelValue.value)) {
    return undefined
  }

  const matchedOption = props.options?.find((item) => item.value === modelValue.value)

  if (matchedOption) {
    return matchedOption
  }

  const matchedListItem = collectVNodeProps<ListOptionSelected>(slots.items?.(), 'PListItem', (p) =>
    p.value === modelValue.value
      ? {
          value: p.value,
          label: p.label,
          description: p.description,
          variant: p.variant,
          disabled: p.disabled,
        }
      : null,
  )[0]

  if (matchedListItem) {
    return matchedListItem
  }

  return undefined
})

function onOptionSelect(item: ListOptionSelected, ev: MouseEvent) {
  emits('select', item, ev)
  modelValue.value = item.value
}
</script>

<template>
  <div class="pxd-split-button inline-flex items-center" v-bind="$attrs">
    <PButton
      :disabled="disabled"
      :variant="variant"
      :shape="shape"
      :size="size"
      class="rounded-r-none"
    >
      <slot :data="selectedItem" />
    </PButton>

    <PMenu
      v-model="modelValue"
      :options="options"
      position="bottom-end"
      :list-width="listWidth"
      :close-on-press-escape="closeOnPressEscape"
      @select="onOptionSelect"
    >
      <PButton
        :disabled="disabled"
        :variant="variant"
        :shape="shape"
        :size="size"
        icon
        class="rounded-l-none border-l-0"
      >
        <slot name="icon">
          <ChevronDownIcon />
        </slot>
      </PButton>

      <template #items>
        <slot name="items" />
      </template>
    </PMenu>
  </div>
</template>
