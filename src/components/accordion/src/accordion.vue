<script lang="ts" setup>
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'radix-vue'

defineOptions({
  name: 'PAccordion',
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
  <AccordionRoot collapsible class="bg-background-100" :default-value="options[0].value">
    <AccordionItem v-for="item in options" :key="item.value" :value="item.value" class="[&:not(:last-child)]:border-b border-gray-400">
      <AccordionHeader class="flex m-0 cursor-pointer text-4">
        <AccordionTrigger
          class="
            group relative w-full text-inherit font-size-inherit font-inherit pl-2 py-3 pr-8 text-left b-0 bg-transparent cursor-pointer
          "
        >
          {{ item.label }}
          <svg class="absolute right-4 top-4 transition-transform group-data-[state=open]:rotate-180" width="1em" height="1em" stroke-linejoin="round" viewBox="0 0 16 16" style="color: currentcolor;"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.0607 5.49999L13.5303 6.03032L8.7071 10.8535C8.31658 11.2441 7.68341 11.2441 7.29289 10.8535L2.46966 6.03032L1.93933 5.49999L2.99999 4.43933L3.53032 4.96966L7.99999 9.43933L12.4697 4.96966L13 4.43933L14.0607 5.49999Z" fill="currentColor" /></svg>
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
