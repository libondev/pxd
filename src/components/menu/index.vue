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
  select: ListOptionCallbackParams
}>()

const popoverRef = shallowRef<InstanceType<typeof PPopover>>()

function closePopover() {
  popoverRef.value?.hide()
}

function onOptionClick(
  ev: ListOptionCallbackParams[0],
  item: ListOptionCallbackParams[1],
  index: ListOptionCallbackParams[2],
) {
  emits('select', ev, item, index)
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
        @hide="closePopover"
        @select="onOptionClick"
      >
        <slot name="items" />
      </PList>
    </template>
  </PPopover>
</template>
