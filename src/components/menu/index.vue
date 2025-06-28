<script lang="ts" setup>
import type { MenuListOption, PopoverPosition } from '../../types/components'
import { shallowRef } from 'vue'
import PMenuList from '../menu-list/index.vue'
import PPopover from '../popover/index.vue'

interface Props {
  options?: MenuListOption[]
  position?: PopoverPosition
  menuWidth?: string | number
}

defineOptions({
  name: 'PMenu',
})

withDefaults(
  defineProps<Props>(),
  {
    position: 'bottom-start',
    options: () => [],
  },
)

const emits = defineEmits<{
  optionClick: [option: MenuListOption, index: number]
}>()

const popoverRef = shallowRef<InstanceType<typeof PPopover>>()

function onOptionClick(option: MenuListOption, index: number) {
  emits('optionClick', option, index)
  popoverRef.value!.hide()
}
</script>

<template>
  <PPopover
    ref="popoverRef"
    trigger="click"
    class="pxd-menu"
    scroll-hidden
    :open-delay="0"
    :hide-delay="200"
    :show-arrow="false"
    :position="position"
    :show-transition="false"
    enterable
  >
    <slot />

    <template #content>
      <PMenuList
        :width="menuWidth"
        :options="options"
        @option-click="onOptionClick"
      >
        <slot name="items" />
      </PMenuList>
    </template>
  </PPopover>
</template>
