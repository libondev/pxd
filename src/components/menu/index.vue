<script lang="ts" setup>
import type { ListOption, ListOptionCallbackParams } from '../../types/components/list'
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
  select: ListOptionCallbackParams
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

function onOptionClick(
  ev: ListOptionCallbackParams[0],
  item: ListOptionCallbackParams[1],
  index: ListOptionCallbackParams[2],
) {
  emits('select', ev, item, index)
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
    @change="onPopoverToggle"
  >
    <slot />

    <template #content>
      <PList
        :width="width"
        :options="options"
        :key-listener="popoverVisible"
        class="list-none rounded-xl bg-background-100 shadow-border-menu outline-none"
        @escape="closePopover"
        @select="onOptionClick"
      >
        <slot name="items" />
      </PList>
    </template>
  </PPopover>
</template>
