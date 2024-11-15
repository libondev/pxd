<script lang="ts" setup>
import type { OptionItem, StandardError } from '#types'

import { CheckIcon, ChevronDownIcon } from '@radix-icons/vue'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxRoot,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxViewport,
} from 'radix-vue'

interface SelectProps {
  error?: StandardError
  placeholder?: string
  options: OptionItem[]
}

defineOptions({
  name: 'PCombobox',
})

defineProps<SelectProps>()

const modelValue = defineModel<string>()
</script>

<template>
  <ComboboxRoot v-model="modelValue" class="pxd-combobox relative">
    <ComboboxAnchor
      class="pxd-combobox--anchor p-focusable h-8 rounded-md"
      :class="{ 'p-focusable-error': error }"
    >
      <ComboboxInput class="outline-0 rounded-inherit" :placeholder="placeholder" />

      <ComboboxTrigger>
        <ChevronDownIcon />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxContent
      class="absolute z-10 w-full mt-2 min-w-[160px] bg-white overflow-hidden rounded shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
    >
      <ComboboxViewport class="p-[5px]">
        <ComboboxEmpty class="text-mauve8 text-xs font-medium text-center py-2" />

        <ComboboxGroup>
          <ComboboxLabel class="px-[25px] text-xs leading-[25px] text-mauve11">
            Fruits
          </ComboboxLabel>

          <ComboboxItem
            v-for="(option, index) in options" :key="index"
            class="text-[13px] leading-none text-grass11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-grass9 data-[highlighted]:text-grass1"
            :value="option"
          >
            <ComboboxItemIndicator class="absolute left-0 w-[25px] inline-flex items-center justify-center">
              <CheckIcon />
            </ComboboxItemIndicator>
            <span>
              {{ option }}
            </span>
          </ComboboxItem>
          <ComboboxSeparator class="h-[1px] bg-grass6 m-[5px]" />
        </ComboboxGroup>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>
