<script lang="ts" setup>
import type {
  ListOption,
  ListOptionEntry,
  ListOptionGroup,
  ListOptionSelected,
} from '../list/types'
import type { SplitButtonProps, SplitButtonEmits } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { isNil } from '../../utils/is'
import PButton from '../button/index.vue'
import PMenu from '../menu/index.vue'

defineOptions({
  name: 'PSplitButton',
  inheritAttrs: false,
})

const props = defineProps<SplitButtonProps>()
const emits = defineEmits<SplitButtonEmits>()

const modelValue = useModelValue(props, emits)

function isListOptionGroup(option: ListOptionEntry): option is ListOptionGroup {
  return option.type === 'group'
}

function resolveOptionByValue(
  options: ListOptionEntry[],
  value: ListOptionSelected['value'],
): ListOption | undefined {
  for (const entry of options) {
    if (isListOptionGroup(entry)) {
      const matchedOption = resolveOptionByValue(entry.options, value)
      if (matchedOption) {
        return matchedOption
      }
    } else if (entry.value === value) {
      return entry
    } else if (entry.children?.length) {
      const matchedOption = resolveOptionByValue(entry.children, value)
      if (matchedOption) {
        return matchedOption
      }
    }
  }
}

const selectedItem = computed((): ListOptionSelected | undefined => {
  if (isNil(modelValue.value)) {
    return undefined
  }

  return resolveOptionByValue(props.options ?? [], modelValue.value)
})

function onOptionSelect(item: ListOptionSelected, ev: MouseEvent) {
  emits('select', item, ev)
}
</script>

<template>
  <PMenu
    v-model="modelValue"
    :options="options"
    :list-width="listWidth"
    position="bottom-end"
    data-button-group
    class="pxd-split-button items-center"
    :data-variant="variant"
    triggerSelector="[data-split-button-trigger]"
    :close-on-press-escape="closeOnPressEscape"
    @select="onOptionSelect"
    v-bind="$attrs"
  >
    <PButton :disabled="disabled" :variant="variant" :shape="shape" :size="size">
      <slot :data="selectedItem" />
    </PButton>

    <PButton
      data-split-button-trigger
      :disabled="disabled"
      :variant="variant"
      :shape="shape"
      :size="size"
      icon
    >
      <slot name="icon">
        <ChevronDownIcon />
      </slot>
    </PButton>

    <template v-if="$slots.item" #item="{ item, index }">
      <slot name="item" :item="item" :index="index" />
    </template>
  </PMenu>
</template>
