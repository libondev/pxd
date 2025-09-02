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
  inheritAttrs: false,
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

const popoverVisible = shallowRef(false)

function showPopover() {
  popoverVisible.value = true
}

function hidePopover() {
  popoverVisible.value = false
}

function onOptionClick(ev: MouseEvent, item: ListOptionSelected) {
  emits('select', ev, item)
  hidePopover()
}
</script>

<template>
  <PPopover
    enterable
    scroll-hidden
    class="pxd-menu"
    trigger="manual"
    :show-delay="0"
    :hide-delay="100"
    :position="position"
    disabled-show-transition
    :visible="popoverVisible"
    :close-on-press-escape="closeOnPressEscape"
    v-bind="$attrs"
    @outside-click="hidePopover"
    @trigger-click="showPopover"
  >
    <slot />

    <template #content>
      <PList
        :width="width"
        :options="options"
        :key-listener="popoverVisible"
        class="max-h-68 rounded-xl bg-background-100 shadow-border-menu"
        @select="onOptionClick"
      >
        <slot name="items" />
      </PList>
    </template>
  </PPopover>
</template>
