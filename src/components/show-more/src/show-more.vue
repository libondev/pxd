<script setup lang="ts">
import { focusVisibleRing } from '@/_utils/style.js'
import { buttonVariants } from '@/components/button/index.js'
import { Icon } from '@iconify/vue'

interface ShowMoreProps {
  expandText?: string
  collapseText?: string
}

withDefaults(
  defineProps<ShowMoreProps>(),
  {
    expandText: 'Show More',
    collapseText: 'Show Less',
  },
)

const emits = defineEmits<{
  (e: 'toggle', value: boolean): void
  (e: 'update:modelValue', value: boolean): void
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

    <div
      class="pxd-show-more--button rounded-full px-3"
      :class="[buttonVariants.base, buttonVariants.outline, focusVisibleRing]"
      @click="onToggleExpand"
    >
      {{ expandValue ? collapseText : expandText }}
      <Icon icon="carbon:chevron-down" class="ml-0.5 -mr-0.5 transition-transform duration-200" :class="{ 'rotate-180': expandValue }" />
    </div>

    <div class="pxd-show-more--line bg-gray-alpha-400 flex-grow h-px" />
  </div>
</template>
