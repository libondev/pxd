<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'radix-vue'

defineOptions({
  name: 'PCollapse',
})

withDefaults(
  defineProps<{
    options: OptionItem[]
  }>(),
  {
    options: () => [],
  },
)

interface OptionItem {
  label: string
  value: string
  content: string
}
</script>

<template>
  <AccordionRoot collapsible class="pxd-collapse bg-background-100" :default-value="options[0].value">
    <AccordionItem v-for="item in options" :key="item.value" :value="item.value" class="[&:not(:last-child)]:border-b border-gray-400">
      <AccordionHeader class="flex m-0 cursor-pointer text-4">
        <AccordionTrigger
          class="
            group relative w-full text-inherit font-size-inherit font-inherit pl-2 py-3 pr-8 text-left b-0 bg-transparent cursor-pointer
          "
        >
          {{ item.label }}
          <Icon icon="carbon:chevron-down" class="absolute right-4 top-4 transition-transform group-data-[state=open]:rotate-180" />
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionContent class="overflow-hidden data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up">
        <div class="p-4 bg-background-200 border-t border-gray-400">
          {{ item.content }}
        </div>
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>
