<script lang="ts" setup>
import type { Ref } from 'vue'
import type { MenuListOption } from '../../types/components'
import { inject } from 'vue'

interface Props {
  index: number
  option: MenuListOption
}

defineOptions({
  name: 'PMenuItem',
})

defineProps<Props>()

const activeIndex = inject<Ref<number>>('menuListActiveIndex')!

function getOptionClass({ type, disabled }: MenuListOption, index: number) {
  return {
    'bg-gray-alpha-100': activeIndex.value === index,
    [type === 'error' ? 'text-red-900' : '']: true,
    [disabled ? 'pointer-events-none text-gray-700' : 'cursor-pointer']: true,
  }
}
</script>

<template>
  <li
    :data-index="index"
    :data-selected="activeIndex === index"
    class="pxd-menu-item h-10 px-2 rounded-md text-sm w-full flex items-center outline-none motion-safe:transition-colors"
    :class="getOptionClass(option, index)"
  >
    <component :is="option.prefix" v-if="option.prefix" />

    <span class="flex-1">
      {{ option.label }}
    </span>

    <component :is="option.suffix" v-if="option.suffix" />
  </li>
</template>

<style>
.pxd-menu-item[data-selected="true"] {
  background-color: var(--color-gray-alpha-100);
}
</style>
