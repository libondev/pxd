<script lang="ts" setup>
import type { ListOption, ListOptionSelected } from '../../types/components/list'
import type { ComponentPosition } from '../../types/shared'
import { shallowRef } from 'vue'
import PList from '../list/index.vue'
import PPopover from '../popover/index.vue'

interface Props {
  width?: string | number
  options?: ListOption[]
  position?: ComponentPosition
  closeOnPressEscape?: boolean
}

defineOptions({
  name: 'PMenu',
})

withDefaults(
  defineProps<Props>(),
  {
    options: () => [],
    position: 'bottom-start',
    closeOnPressEscape: true,
  },
)

const emits = defineEmits<{
  change: [visible: boolean]
  select: [MouseEvent, ListOptionSelected]
}>()

const popoverRef = shallowRef<InstanceType<typeof PPopover>>()
const popoverVisible = shallowRef(false)

function closePopover() {
  popoverRef.value?.hide()
}

function onPopoverToggle(visible: boolean) {
  emits('change', visible)
  popoverVisible.value = visible
}

function onOptionClick(ev: MouseEvent, item: ListOptionSelected) {
  emits('select', ev, item)
  closePopover()
}
</script>

<template>
  <PPopover
    ref="popoverRef"
    enterable
    trigger="click"
    class="pxd-menu"
    scroll-hidden
    :show-delay="0"
    :hide-delay="100"
    :position="position"
    :show-transition="false"
    :close-on-press-escape="closeOnPressEscape"
    @visible-change="onPopoverToggle"
  >
    <slot />

    <template #content>
      <PList
        :width="width"
        :options="options"
        :key-listener="popoverVisible"
        class="max-h-68 list-none rounded-xl bg-background-100 shadow-border-menu outline-none"
        @select="onOptionClick"
      >
        <slot name="items" />
      </PList>
    </template>
  </PPopover>
</template>
