<script lang="ts" setup>
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger
} from 'radix-vue'

defineOptions({
  name: 'PxAccordion'
})

interface OptionItem {
  label: string
  value: string
  content: string
}

defineProps({
  type: {
    type: String as PropType<'single' | 'multiple'>,
    default: 'single'
  },
  options: {
    type: Array as PropType<OptionItem[]>,
    default: () => []
  }
})
</script>

<template>
  <AccordionRoot
    :type="type"
    collapsible
    class="bg-background"
    default-value="item-1"
  >
    <template v-for="item in options" :key="item.value">
      <AccordionItem :value="item.value" class="b-(b-1 b-solid input)">
        <AccordionHeader class="flex m-0 cursor-pointer text-4">
          <AccordionTrigger
            class="relative w-full text-inherit font-size-inherit font-inherit pl-2 py-3 pr-6 text-left b-0 bg-transparent cursor-pointer after:(content-empty absolute transition-transform transition-duration-300 text-sm right-1.5 top-50% translate-y--50% i-ic-round-arrow-back-ios rotate--90deg data-[state=open]:rotate-90deg)"
          >
            {{ item.label }}
          </AccordionTrigger>
        </AccordionHeader>

        <AccordionContent class="overflow-hidden px-4 pb-4 animated data-[state=open]:animated-fade-in">
            {{ item.content }}
        </AccordionContent>
      </AccordionItem>
    </template>
  </AccordionRoot>
</template>
