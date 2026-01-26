<script lang="ts" setup>
import type { ListOption, ListOptionSelected } from '../../types/components/list'
import type { ComponentPosition } from '../../types/shared'
import { shallowRef } from 'vue'
import { usePopoverResponsive } from '../../composables/use-popover-responsive'
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
  select: [ListOptionSelected, MouseEvent]
}>()

const { isXs, attrs } = usePopoverResponsive()

const popoverVisible = shallowRef(false)

function onVisibleChange(visible: boolean) {
  popoverVisible.value = visible
}

function hidePopover() {
  onVisibleChange(false)
}

function onOptionClick(ev: MouseEvent, item: ListOptionSelected) {
  emits('select', item, ev)
  hidePopover()
}
</script>

<template>
  <PPopover
    enterable
    class="pxd-menu"
    trigger="click"
    :show-delay="0"
    :hide-delay="100"
    :position="position"
    :visible="popoverVisible"
    :unset-position="isXs"
    :wrapper-class="attrs.wrapperClass"
    :content-class="attrs.contentClass"
    :transition-type="attrs.transitionType"
    :lock-scroll-on-visible="isXs"
    :close-on-press-escape="closeOnPressEscape"
    v-bind="$attrs"
    @escape="hidePopover"
    @outside-click="hidePopover"
    @visible-change="onVisibleChange"
  >
    <slot />

    <template #content>
      <PList
        :width="width"
        :options="options"
        :key-listener="popoverVisible"
        class="max-h-68 rounded-inherit"
        @select="onOptionClick"
      >
        <slot name="items" />
      </PList>
    </template>
  </PPopover>
</template>
