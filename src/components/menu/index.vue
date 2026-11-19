<script lang="ts" setup>
import type { ListModelValue } from '../list/types'
import type { MenuEmits, MenuProps } from './types'
import { computed, nextTick, shallowRef, watch } from 'vue'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { changeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useListSelection } from '../../composables/_internal/use-list-selection.js'
import { POPOVER_PANEL_CLASS } from '../../constants/popover-panel.js'
import { isNil } from '../../utils/is.js'
import PList from '../list/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PMenu',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MenuProps>(), {
  options: () => [],
  position: 'bottom-start',
})

const emits = defineEmits<MenuEmits>()

const listRef = shallowRef<InstanceType<typeof PList>>()
const popoverVisible = shallowRef(false)

const notify = useAgentChange(emits)
const { selected, apply, reset, commit } = useListSelection({
  modelValue: () => props.modelValue,
  multiple: () => props.multiple,
  onUpdateModelValue: (value) => emits('update:model-value', value),
  onChange: (value) => notify(value, changeDetailsFor({ reason: 'item-press' })),
})

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

useAgentNode({
  name: 'menu',
  namedBy: 'button',
  closed: true,
  owns: () => listRef.value?.$el,
  items: () => optionItems(props.options, selected.value),
  itemElement: (value) => listRef.value?.elementOf(value),
  state: () => ({ value: selected.value ?? null, open: popoverVisible.value }),
  actions: {
    setValue: (value) => {
      if (apply((value ?? null) as NonNullable<ListModelValue>)) {
        popoverVisible.value = false
        return
      }

      commit()
    },
    setOpen: (open) => {
      popoverVisible.value = Boolean(open)
    },
    toggle: () => {
      popoverVisible.value = !popoverVisible.value
    },
  },
})

function onListModelUpdate(value: ListModelValue) {
  if (isNil(value)) {
    return
  }

  if (apply(value)) {
    popoverVisible.value = false
  }
}

watch(popoverVisible, async (visible) => {
  if (visible) {
    reset()
    await nextTick()
    listRef.value?.focus()
    return
  }

  commit()
})
</script>

<template>
  <PPopover
    data-menu
    v-model="popoverVisible"
    class="pxd-menu"
    trigger="click"
    :disabled="disabled"
    :position="position"
    match-width
    :content-class="POPOVER_PANEL_CLASS"
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

      <div v-if="$slots.footer" class="pxd-menu--footer p-2 border-t">
        <slot name="footer" />
      </div>
    </template>
  </PPopover>
</template>
