<script lang="ts" setup>
import type { SelectEmits, SelectProps } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
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

const props = withDefaults(defineProps<SelectProps>(), {
  suffixIcon: true,
})
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
    position="bottom"
    :disabled="disabled"
    :multiple="multiple"
    v-bind="$attrs"
    :close-on-press-escape="closeOnPressEscape"
  >
    <template #default="{ popoverVisible }">
      <PButton
        class="px-1.5 justify-between"
        align="left"
        full-width
        :class="{ 'text-gray-600': !translatedLabel }"
        :variant="variant"
        :shape="shape"
        :size="computedSize"
        :disabled="disabled"
      >
        <template v-if="$slots.prefix" #prefix>
          <slot name="prefix" />
        </template>

        <template v-if="translatedLabel">
          <slot :label="translatedLabel">{{ translatedLabel }}</slot>
        </template>
        <template v-else>
          {{ placeholder }}
        </template>

        <template v-if="suffixIcon" #suffix>
          <ChevronDownIcon
            class="text-sm mr-1.5 text-foreground-secondary motion-safe:transition-transform"
            :class="{ 'rotate-180': popoverVisible }"
          />
        </template>
      </PButton>
    </template>

    <template v-if="$slots.item" #item="scope">
      <slot name="item" v-bind="scope" />
    </template>
  </PMenu>
</template>
