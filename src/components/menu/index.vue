<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import type { MenuEmits, MenuProps } from './types'
import { nextTick, shallowRef, watch } from 'vue'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useListSelection } from '../../composables/_internal/use-list-selection.js'
import { usePopoverResponsive } from '../../composables/_internal/use-popover-responsive.js'
import PList from '../list/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PMenu',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<MenuProps>(), {
  options: () => [],
  position: 'bottom-start',
  closeOnPressEscape: true,
})

const emits = defineEmits<MenuEmits>()
const { selected, select, reset, commit } = useListSelection(props, emits)
const { isAdaptive, responsiveClasses } = usePopoverResponsive()

const popoverVisible = shallowRef(false)
const listRef = shallowRef<InstanceType<typeof PList>>()

const { onKeydown } = useListKeyboardController({
  enabled: () => popoverVisible.value,
  onCommand: (command) => listRef.value?.dispatch(command) ?? false,
  keymap: {
    ArrowDown: 'next',
    ArrowLeft: 'leave-parent',
    ArrowRight: 'enter-child',
    ArrowUp: 'previous',
    End: 'last',
    Enter: 'activate',
    Home: 'first',
    ' ': 'activate',
  },
})

watch(popoverVisible, async (visible) => {
  if (visible) {
    reset()
    await nextTick()
    listRef.value?.focus()
    return
  }

  commit()
})

function onOptionSelect(item: ListOptionSelected) {
  if (select(item.value as string | number)) {
    popoverVisible.value = false
  }
}
</script>

<template>
  <PPopover
    v-model="popoverVisible"
    class="pxd-menu"
    trigger="click"
    :disabled="disabled"
    :position="position"
    :adaptive="isAdaptive"
    :wrapper-class="responsiveClasses.wrapper"
    :content-class="responsiveClasses.content"
    :lock-scroll-on-visible="isAdaptive"
    :close-on-press-escape="closeOnPressEscape"
    v-bind="$attrs"
    @wrapper-keydown="onKeydown"
  >
    <slot />

    <template #content>
      <PList
        ref="listRef"
        :value="selected"
        :options="options"
        :visible="popoverVisible"
        :multiple="multiple"
        class="max-h-68 rounded-inherit"
        @change="onOptionSelect"
      >
        <template v-if="$slots.item" #item="itemSlotProps">
          <slot name="item" v-bind="itemSlotProps" />
        </template>
      </PList>
    </template>
  </PPopover>
</template>
