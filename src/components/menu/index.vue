<script lang="ts" setup>
import type { ComponentPosition, MenuListOption } from '../../types/components'
import { provide, shallowRef } from 'vue'
import PMenuList from '../menu-list/index.vue'
import PPopover from '../popover/index.vue'

interface Props {
  options?: MenuListOption[]
  position?: ComponentPosition
  width?: string | number
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
  selected: [ev: MouseEvent, index: number]
}>()

const popoverRef = shallowRef<InstanceType<typeof PPopover>>()

function onOptionClick(ev: MouseEvent, index: number) {
  emits('selected', ev, index)
  popoverRef.value!.hide()
}

provide('pxdMenu', {
  onOptionClick,
})
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
        :width="width"
        :options="options"
        @selected="onOptionClick"
      >
        <slot name="items" />
      </PMenuList>
    </template>
  </PPopover>
</template>
