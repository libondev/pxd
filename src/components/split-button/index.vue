<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import type { SplitButtonProps, SplitButtonEmits } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useSelectedListItem } from '../../composables/_internal/use-selected-list-item.js'
import PButton from '../button/index.vue'
import PMenu from '../menu/index.vue'

defineOptions({
  name: 'PSplitButton',
  inheritAttrs: false,
})

const props = defineProps<SplitButtonProps>()
const emits = defineEmits<SplitButtonEmits>()

const modelValue = useModelValue(props, emits)
const selectedItem = useSelectedListItem(() => props.options || [], modelValue)

function onOptionSelect(item: ListOptionSelected, ev: MouseEvent) {
  emits('select', item, ev)
}
</script>

<template>
  <PMenu
    v-model="modelValue"
    data-group
    position="bottom-end"
    class="pxd-split-button items-center"
    triggerSelector="[data-split-button-trigger]"
    :options="options"
    :data-variant="variant"
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
