<script lang="ts" setup>
import type { ListOptionEntry, ListOptionGroup, ListOptionSelected } from '../list/types'
import type { SplitButtonProps, SplitButtonEmits } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { isNil } from 'es-toolkit'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
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

const selectedItem = computed((): ListOptionSelected | undefined => {
  if (isNil(modelValue.value)) {
    return undefined
  }

  for (const entry of props.options ?? []) {
    if (isListOptionGroup(entry)) {
      const matchedOption = entry.options.find((item) => item.value === modelValue.value)

      if (matchedOption) {
        return matchedOption
      }

      continue
    }

    if (entry.value === modelValue.value) {
      return entry
    }
  }
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

      <template v-if="$slots.item" #item="{ item, index }">
        <slot name="item" :item="item" :index="index" />
      </template>
    </PMenu>
  </div>
</template>
