<script lang="ts" setup>

defineProps({
  gap: {
    type: String as PropType<Sizes>,
    default: 4,
  },
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
})

const gapMap = {
  sm: 'gap-2',
  default: 'gap-4',
  lg: 'gap-8'
}
</script>

<template>
  <div
    role="listbox"
    dir="ltr"
    :aria-orientation="direction"
    :data-orientation="direction"
    class="flex data-[orientation=vertical]:flex-col"
    :class="gapMap[gap] || gapMap.default"
  >
    <slot />
  </div>
</template>
