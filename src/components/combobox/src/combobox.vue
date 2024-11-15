<script lang="ts" setup>
import type { OptionItem, StandardError, StandardSize } from '#types'

import { getInputSizes } from '#/components/input/index.js'
import { CheckIcon, ChevronDownIcon, Cross2Icon, MagnifyingGlassIcon } from '@radix-icons/vue'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  // ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  // ComboboxLabel,
  ComboboxRoot,
  // ComboboxSeparator,
  ComboboxTrigger,
  ComboboxViewport,
} from 'radix-vue'

interface SelectProps {
  size?: StandardSize
  error?: StandardError
  disabled?: boolean
  placeholder?: string
  options: OptionItem[]
  emptyText?: string
}

defineOptions({
  name: 'PCombobox',
})

const {
  size = 'default',
  options,
  placeholder = 'Search...',
  emptyText = 'Nothing to see here...',
} = defineProps<SelectProps>()

const modelValue = defineModel<string>()
const _internalValue = shallowRef({} as OptionItem)

const inputSize = computed(() => getInputSizes(size))

function updateModelValue(option: any) {
  modelValue.value = option.value
}

function resetInternalValue() {
  _internalValue.value = {} as OptionItem
}

function clearModelValue() {
  modelValue.value = ''
  resetInternalValue()
}

watchEffect(() => {
  if (modelValue.value) {
    const option = options.find(option => option.value === modelValue.value)

    if (option) {
      _internalValue.value = option
      return
    }
  }

  resetInternalValue()
})
</script>

<template>
  <ComboboxRoot v-model="_internalValue" :disabled="disabled" class="pxd-combobox relative" @update:model-value="updateModelValue">
    <ComboboxAnchor
      :data-disabled="disabled"
      class="p-focusable rounded-md"
      :class="[{ 'p-focusable-error': error }, inputSize]"
    >
      <div class="absolute left-0 top-0 text-gray-700 w-8 h-full flex items-center">
        <MagnifyingGlassIcon class="mx-auto" />
      </div>

      <ComboboxInput
        class="px-8 w-full h-full rounded-inherit p-input"
        :placeholder="placeholder"
        :value="_internalValue?.label"
      />

      <ComboboxTrigger class="absolute right-0 top-0 text-gray-700 w-8 h-full flex items-center justify-center transition-transform data-[state=open]:rotate-180">
        <span v-if="modelValue" class="inline-block w-fit h-fit p-0.5 rounded-full transition-colors hover:bg-gray-alpha-300" @click.stop="clearModelValue">
          <Cross2Icon />
        </span>
        <ChevronDownIcon v-else />
      </ComboboxTrigger>

      <PError v-if="error" :error="error" class="mt-2" />
    </ComboboxAnchor>

    <ComboboxContent
      class="absolute p-shadow-border-large z-10 w-full mt-2 min-w-40 bg-white overflow-hidden rounded-lg data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
    >
      <ComboboxViewport class="p-select-list p-2 text-sm">
        <ComboboxEmpty class="text-gray-alpha-600 text-xs font-medium text-center py-2 select-none">
          {{ emptyText }}
        </ComboboxEmpty>

        <!-- <ComboboxGroup> -->
        <ComboboxItem
          v-for="(option, index) in options"
          :key="index"
          :value="option"
          :title="option.label"
          :disabled="option.disabled"
          class="
            p-select-item outline-0 flex items-center h-9 pl-7 pr-2 relative select-none rounded-md
            data-[disabled]:text-gray-alpha-600 data-[disabled]:cursor-not-allowed data-[state=checked]:text-gray-1000
          "
        >
          <ComboboxItemIndicator class="absolute left-1 w-6 inline-flex items-center justify-center">
            <CheckIcon />
          </ComboboxItemIndicator>

          {{ option.value }}
        </ComboboxItem>
        <!-- <ComboboxSeparator class="h-[1px] bg-grass6 m-[5px]" />
        </ComboboxGroup> -->
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>
