<script lang="ts" setup>
import type { ComponentPosition, MenuListOption } from '../../types/components'
import { shallowRef } from 'vue'
import PMenuList from '../menu-list/index.vue'
import PPopover from '../popover/index.vue'

interface Props {
  options?: MenuListOption[]
  position?: ComponentPosition
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
  selected: [option: MenuListOption, index: number]
}>()

const popoverRef = shallowRef<InstanceType<typeof PPopover>>()

function onOptionClick(option: MenuListOption, index: number) {
  emits('selected', option, index)
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
        @selected="onOptionClick"
      >
        <slot name="items" />
      </PMenuList>
    </template>
  </PPopover>
</template>
