<script lang="ts" setup>
import type { MenuListOption } from '../../types/components/menu'
import type { ComponentPosition } from '../../types/shared'
import { shallowRef } from 'vue'
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
</script>

<template>
  <PPopover
    ref="popoverRef"
    trigger="click"
    class="pxd-menu"
    scroll-hidden
    :show-delay="0"
    :hide-delay="100"
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
        class="shadow-border-menu bg-background rounded-xl p-2 pr-0 list-none outline-none"
        @selected="onOptionClick"
      >
        <slot name="items" />
      </PMenuList>
    </template>
  </PPopover>
</template>
