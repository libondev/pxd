<script lang="ts" setup>
import type { SplitButtonProps, SplitButtonEmits } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { computed } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useSelectedListItem } from '../../composables/_internal/use-selected-list-item.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PButton from '../button/index.vue'
import PMenu from '../menu/index.vue'

defineOptions({
  name: 'PSplitButton',
  inheritAttrs: false,
})

const props = defineProps<SplitButtonProps>()
const emits = defineEmits<SplitButtonEmits>()

const { modelValue, change } = useModelValue(props, emits)
const selectedItem = useSelectedListItem(() => props.options || [], modelValue)
const configProvider = useConfigProvider()

const computedSize = computed(() => props.size || configProvider.size)

useAgentNode({
  name: 'split-button',
  namedBy: 'button',
  state: () => ({ value: modelValue.value ?? null }),
  actions: {
    setValue: (value) => {
      change(value, { reason: 'api' })
    },
  },
})
function onModelUpdate(value: SplitButtonProps['modelValue']) {
  change(value, { reason: 'item-press' })
}
</script>

<template>
  <PMenu
    data-split-button
    :model-value="modelValue"
    @update:model-value="onModelUpdate"
    data-group
    position="bottom-end"
    class="pxd-split-button items-center"
    triggerSelector="[data-split-button-trigger]"
    :options="options"
    :data-variant="variant"
    v-bind="$attrs"
  >
    <PButton
      :shape="shape"
      :variant="variant"
      :size="computedSize"
      :disabled="disabled"
      v-bind="mainButtonProps"
      @click="emits('main-click')"
    >
      <slot :data="selectedItem" />
    </PButton>

    <PButton
      icon-only
      :shape="shape"
      :variant="variant"
      :disabled="disabled"
      :size="computedSize"
      data-split-button-trigger
    >
      <slot name="icon">
        <ChevronDownIcon />
      </slot>
    </PButton>

    <template v-if="$slots.item" #item="itemSlotProps">
      <slot name="item" v-bind="itemSlotProps" />
    </template>

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </PMenu>
</template>
