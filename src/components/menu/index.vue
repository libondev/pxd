<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import type { MenuEmits, MenuProps } from './types'
import { shallowRef } from 'vue'
import { usePopoverResponsive } from '../../composables/use-popover-responsive'
import { getCssUnitValue } from '../../utils/format'
import PList from '../list/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PMenu',
  inheritAttrs: false,
})

withDefaults(defineProps<MenuProps>(), {
  options: () => [],
  showDelay: 0,
  hideDelay: 100,
  position: 'bottom-start',
  closeOnPressEscape: true,
})

const emits = defineEmits<MenuEmits>()

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
    class="pxd-menu"
    trigger="click"
    :show-delay="isXs ? 0 : showDelay"
    :hide-delay="isXs ? 0 : hideDelay"
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
        :style="{ '--list-width': getCssUnitValue(width) }"
        class="max-h-68 sm:w-(--list-width) rounded-inherit"
        @select="onOptionClick"
      >
        <slot name="items" />
      </PList>
    </template>
  </PPopover>
</template>
