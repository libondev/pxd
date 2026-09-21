<script lang="ts" setup>
import type { ListModelValue } from '../list/types'
import type { MenuEmits, MenuProps } from './types'
import { computed, nextTick, shallowRef, watch } from 'vue'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useListSelection } from '../../composables/_internal/use-list-selection.js'
import { usePopoverResponsive } from '../../composables/_internal/use-popover-responsive.js'
import { isNil } from '../../utils/is.js'
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
const listRef = shallowRef<InstanceType<typeof PList>>()

const { selected, apply, reset, commit } = useListSelection(props, emits)
const { isAdaptive, responsiveClasses } = usePopoverResponsive()

const popoverVisible = shallowRef(false)

// Action menus (no v-model) keep List uncontrolled so checkmarks never appear.
// Selection menus forward the session `selected` that List already toggled.
const listModelValue = computed(() => {
  if (props.modelValue === undefined) {
    return undefined
  }

  return selected.value
})

const { onKeydown } = useListKeyboardController({
  enabled: () => popoverVisible.value,
  onCommand: (command) => listRef.value?.dispatch(command) ?? false,
  keymap: {
    ArrowDown: 'next',
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

function onListModelUpdate(value: ListModelValue) {
  if (isNil(value)) {
    return
  }

  if (apply(value)) {
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
    <slot :popover-visible="popoverVisible" />

    <template #content>
      <PList
        ref="listRef"
        :model-value="listModelValue"
        :options="options"
        :multiple="multiple"
        :virtual="virtual"
        class="max-h-68 rounded-inherit"
        @update:model-value="onListModelUpdate"
      >
        <template v-if="$slots.item" #item="itemSlotProps">
          <slot name="item" v-bind="itemSlotProps" />
        </template>
      </PList>
    </template>
  </PPopover>
</template>
