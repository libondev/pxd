<script lang="ts" setup>
import type { ListOption } from '../../types/components/list'
import type { ComponentPosition } from '../../types/shared'
import { shallowRef } from 'vue'
import PList from '../list/index.vue'
import PPopover from '../popover/index.vue'

interface Props {
  width?: string | number
  options?: ListOption[]
  position?: ComponentPosition
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

function closePopover() {
  popoverRef.value?.hide()
}

function onOptionClick(ev: MouseEvent, index: number) {
  emits('selected', ev, index)
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
    :position="position"
    :show-transition="false"
    enterable
  >
    <slot />

    <template #content>
      <PList
        :width="width"
        :options="options"
        class="list-none rounded-xl bg-background-100 shadow-border-menu outline-none"
        @close="closePopover"
        @selected="onOptionClick"
      >
        <slot name="items" />
      </PList>
    </template>
  </PPopover>
</template>
