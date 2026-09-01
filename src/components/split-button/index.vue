<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import type { SplitButtonProps, SplitButtonEmits } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { computed } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useSelectedListItem } from '../../composables/_internal/use-selected-list-item.js'
import { useConfigProvider } from '../../contexts/config-provider.ts'
import PButton from '../button/index.vue'
import PMenu from '../menu/index.vue'

defineOptions({
  name: 'PSplitButton',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<SplitButtonProps>()
const emits = defineEmits<SplitButtonEmits>()

const modelValue = useModelValue(props, emits)
const selectedItem = useSelectedListItem(() => props.options || [], modelValue)
const configProvider = useConfigProvider()

const computedSize = computed(() => props.size || configProvider.size)

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
    <PButton :disabled="disabled" :variant="variant" :shape="shape" :size="computedSize">
      <slot :data="selectedItem" />
    </PButton>

    <PButton
      data-split-button-trigger
      :disabled="disabled"
      :variant="variant"
      :shape="shape"
      :size="computedSize"
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
