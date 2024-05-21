<script lang="ts" setup>
import {
  SelectContent,
  // SelectGroup,
  SelectItem,
  SelectItemIndicator,
  SelectPortal,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'radix-vue'

defineOptions({
  name: 'PSelect',
})

defineProps({
  size: {
    type: String as PropType<Size>,
    default: 'default',
  },
  options: {
    type: Array as PropType<OptionItem[]>,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const selectedValue = defineModel<string>()
</script>

<template>
  <SelectRoot v-model="selectedValue">
    <SelectTrigger
      class="pxd-select shadow-sm inline-flex w-full text-inherit font-inherit items-center b-(1 solid input) outlines bg-background text-sm data-[disabled]:(cursor-not-allowed bg-secondary b-transparent)"
      :class="getSize(size)"
      aria-label="Customize options"
    >
      <SelectValue :data-tips="placeholder" class="w-full text-left empty:before:(content-[attr(data-tips)] text-gray/500)" />
    </SelectTrigger>

    <SelectPortal to="body">
      <SelectContent
        class="relative z-10 min-w-40 w-full overflow-hidden rounded-md b-(1 solid input) bg-popover text-popover-foreground shadow-md animated animated-duration-150 data-[state=open]:animated-zoom-in data-[side=bottom]:origin-top data-[side=left]:origin-left-center data-[side=right]:origin-right-center data-[side=top]:origin-bottom"
        :side-offset="5"
        position="popper"
      >
        <SelectScrollUpButton class="flex-center h-5 z-11 absolute top-0 cursor-n-resize w-full bg-background cursor-default hover:bg-secondary">
          <i class="i-ic-round-arrow-back-ios rotate-90deg" />
        </SelectScrollUpButton>

        <SelectViewport class="py-1 max-h-50">
          <template v-if="options.length">
            <SelectItem
              v-for="(option, index) in options"
              :key="option.value + index"
              class="relative flex items-center cursor-default select-none rounded-sm py-1.5 pl-7 pr-2 mx-1 truncate text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:(pointer-events-none op-50)"
              :disabled="option.disabled"
              :title="option.label"
              :value="option.value"
            >
              <SelectItemIndicator as-child>
                <i class="i-ic-check absolute left-2" />
              </SelectItemIndicator>

              {{ option.value }}
            </SelectItem>
          </template>
          <div v-else class="text-center cursor-default pointer-events-none select-none py-1.5 px-2 truncate text-sm op-50">
            Not has options
          </div>
        </SelectViewport>

        <SelectScrollDownButton class="flex-center h-5 z-11 absolute bottom-0 cursor-s-resize w-full bg-background cursor-default hover:bg-secondary">
          <i class="i-ic-round-arrow-back-ios rotate--90deg" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
