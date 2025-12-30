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

function onVisibleChange(visible: boolean) {
  popoverVisible.value = visible
}

function showPopover() {
  onVisibleChange(true)
}

function hidePopover() {
  onVisibleChange(false)
}

function onOptionClick(ev: MouseEvent, item: ListOptionSelected) {
  emits('select', ev, item)
  hidePopover()
}
</script>

<template>
  <PPopover
    enterable
    close-on-scroll
    class="pxd-menu"
    trigger="manual"
    :show-delay="0"
    :hide-delay="100"
    :position="position"
    :visible="popoverVisible"
    close-on-invisible
    :close-on-press-escape="closeOnPressEscape"
    transition-name="pxd-transition--fade"
    v-bind="$attrs"
    @escape="hidePopover"
    @outside-click="hidePopover"
    @trigger-click="showPopover"
    @visible-change="onVisibleChange"
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
