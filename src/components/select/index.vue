<script lang="ts" setup>
import type { ListModelValue } from '../list/types'
import type { SelectEmits, SelectProps } from './types'
import { computed } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useSelectedListItems } from '../../composables/_internal/use-selected-list-item.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PButton from '../button/index.vue'
import PMenu from '../menu/index.vue'

defineOptions({
  name: 'PSelect',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<SelectProps>()
const emits = defineEmits<SelectEmits>()

const modelValue = useModelValue(props, emits)
const selectedItems = useSelectedListItems(() => props.options || [], modelValue)
const configProvider = useConfigProvider()

const computedSize = computed(() => props.size || configProvider.size)

const translatedLabel = computed(() => {
  if (props.labelFormat) {
    return props.labelFormat(selectedItems.value)
  }

  return selectedItems.value.map((item) => item.label).join(', ')
})
</script>

<template>
  <PMenu
    v-model="modelValue"
    class="pxd-select"
    :options="options"
    :disabled="disabled"
    :multiple="multiple"
    v-bind="$attrs"
    :close-on-press-escape="closeOnPressEscape"
  >
    <PButton
      class="px-1.5"
      align="left"
      full-width
      :class="{ 'text-gray-600': !translatedLabel }"
      :variant="variant"
      :shape="shape"
      :size="computedSize"
      :disabled="disabled"
    >
      {{ translatedLabel || placeholder }}
    </PButton>

    <template v-if="$slots.item" #item="scope">
      <slot name="item" v-bind="scope" />
    </template>
  </PMenu>
</template>
