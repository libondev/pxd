<script setup lang="ts">
import type { ChoiceboxProvider } from '../../choicebox-group'
import { ChoiceboxInjectionKey } from '../../choicebox-group'

interface ChoiceboxProps {
  title: string
  value: string
  description?: string
}

const props = withDefaults(
  defineProps<ChoiceboxProps>(),
  {},
)

const {
  multiple,
  modelValue,
  onChoiceboxItemChange,
} = inject(ChoiceboxInjectionKey) as ChoiceboxProvider

const isSelected = computed(() => modelValue.value?.includes(props.value))
</script>

<template>
  <li
    tabindex="0"
    :aria-selected="isSelected"
    :data-selected="isSelected"
    class="pxd-choicebox-item w-full rounded-md cursor-pointer border border-gray-400 bg-background-100 transition-colors hover:bg-gray-100 hover:border-gray-500 data-[selected=true]:border-blue-600 data-[selected=true]:bg-blue-100 data-[selected=true]:text-blue-900"
    @click="onChoiceboxItemChange(value)"
  >
    <div class="flex gap-6 items-center justify-between p-3">
      <div class="flex flex-col items-stretch justify-start">
        <span class="font-medium text-sm">{{ title }}</span>
        <span class="font-normal text-sm opacity-90 empty:hidden">{{ description }}</span>
      </div>

      <span v-if="multiple" :data-selected="isSelected" class="relative group block size-4 rounded border border-gray-500 bg-background-100 data-[selected=true]:border-blue-900 data-[selected=true]:bg-blue-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32" class="hidden group-data-[selected=true]:block absolute left-[-1px] top-[-1px] m-auto p-px">
          <path fill="none" stroke="var(--p-background-100)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="translate-y-[2px]" d="M28 7L13 22L5 14" />
        </svg>
      </span>

      <span v-else :data-selected="isSelected" class="relative group block size-4 rounded-full bg-background-100 border border-gray-500 data-[selected=true]:border-blue-900">
        <i class="hidden group-data-[selected=true]:block absolute inset-0 m-auto w-1/2 h-1/2 rounded-full bg-blue-900" />
      </span>
    </div>

    <div v-if="$slots.default" class="border-t border-inherit p-2 flex justify-center">
      <slot />
    </div>
  </li>
</template>
