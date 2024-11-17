<script setup lang="ts">
import Button from '~/button/index.js'
import { ChevronDownIcon } from '@radix-icons/vue'

interface ShowMoreProps {
  expandText?: string
  collapseText?: string
}

const {
  expandText = 'Show More',
  collapseText = 'Show Less',
} = defineProps<ShowMoreProps>()

const emits = defineEmits<{
  'toggle': [value: boolean]
  'update:modelValue': [value: boolean]
}>()

const expandValue = defineModel<boolean>()

function onToggleExpand() {
  expandValue.value = !expandValue.value

  emits('toggle', expandValue.value)
  emits('update:modelValue', expandValue.value)
}
</script>

<template>
  <div class="pxd-show-more mt-5 ml-5 flex items-center w-[calc(100%-40px)] min-h-[30px]">
    <div class="pxd-show-more--line bg-gray-alpha-400 flex-grow h-px" />

    <Button variant="outline" shape="rounded" @click="onToggleExpand">
      {{ expandValue ? collapseText : expandText }}

      <template #suffix>
        <ChevronDownIcon class="-ml-0.5 transition-transform duration-200" :class="{ 'rotate-180': expandValue }" />
      </template>
    </Button>

    <div class="pxd-show-more--line bg-gray-alpha-400 flex-grow h-px" />
  </div>
</template>
