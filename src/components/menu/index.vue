<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import type { MenuEmits, MenuProps } from './types'
import { computed, shallowRef } from 'vue'
import { usePopoverResponsive } from '../../composables/use-popover-responsive'
import { getCssUnitValue } from '../../utils/format'
import PList from '../list/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PMenu',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MenuProps>(), {
  options: () => [],
  showDelay: 0,
  hideDelay: 100,
  position: 'bottom-start',
  closeOnPressEscape: true,
})

const emits = defineEmits<MenuEmits>()

const { isAdaptive, responsiveClasses } = usePopoverResponsive()

const popoverVisible = shallowRef(false)

const listStyles = computed(() => ({
  '--list-width': getCssUnitValue(props.width),
}))

function onVisibleChange(visible: boolean) {
  popoverVisible.value = visible
}

function hidePopover() {
  onVisibleChange(false)
}

function onOptionClick(item: ListOptionSelected, ev: MouseEvent) {
  emits('select', item, ev)
  hidePopover()
}
</script>

<template>
  <PPopover
    class="pxd-menu"
    trigger="click"
    :visible="popoverVisible"
    :position="position"
    :adaptive="isAdaptive"
    :show-delay="showDelay"
    :hide-delay="hideDelay"
    :wrapper-class="responsiveClasses.wrapper"
    :content-class="responsiveClasses.content"
    :lock-scroll-on-visible="isAdaptive"
    :close-on-press-escape="closeOnPressEscape"
    v-bind="$attrs"
    @escape="hidePopover"
    @visible-change="onVisibleChange"
  >
    <slot />

    <template #content>
      <PList
        :width="width"
        :options="options"
        :style="listStyles"
        :visible="popoverVisible"
        class="max-h-68 sm:w-(--list-width) rounded-inherit"
        @select="onOptionClick"
      >
        <slot name="items" />
      </PList>
    </template>
  </PPopover>
</template>
