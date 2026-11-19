<script lang="ts" setup>
import type { ListKeyboardMap } from '../../composables/_internal/use-list-keyboard-controller'
import type { ListModelValue } from '../list/types'
import type { SelectEmits, SelectProps } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import CrossIcon from '@gdsicon/vue/cross'
import { computed, nextTick, shallowRef, watch } from 'vue'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { changeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useListSearch } from '../../composables/_internal/use-list-search.js'
import { useListSelection } from '../../composables/_internal/use-list-selection.js'
import { useSelectedListItems } from '../../composables/_internal/use-selected-list-item.js'
import { POPOVER_PANEL_CLASS } from '../../constants/popover-panel.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getUniqueId } from '../../utils/helper.js'
import { isNil } from '../../utils/is.js'
import PButton from '../button/index.vue'
import PList from '../list/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PSelect',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SelectProps>(), {
  suffixIcon: true,
  clearable: false,
})
const emits = defineEmits<SelectEmits>()

const listId = getUniqueId('select-list')
const searchInputId = getUniqueId('select-search')
const FILTERABLE_KEYMAP: ListKeyboardMap = {
  ArrowDown: 'next',
  ArrowUp: 'previous',
  Enter: 'activate',
  Home: 'first',
  End: 'last',
}

const DEFAULT_KEYMAP: ListKeyboardMap = {
  ...FILTERABLE_KEYMAP,
  ' ': 'activate',
}

const popoverVisible = shallowRef(false)
const listRef = shallowRef<InstanceType<typeof PList>>()
const searchInputRef = shallowRef<HTMLInputElement>()

const filterKeyword = shallowRef('')

const hasValue = computed(() => {
  const value = props.modelValue

  return props.multiple ? Array.isArray(value) && value.length > 0 : !isNil(value) && value !== ''
})
const showClear = computed(() => props.clearable && hasValue.value && !props.disabled)

const notify = useAgentChange(emits)
// Resolved from the full options so a selected item that the filter drops still has a label.
const selectedItems = useSelectedListItems(
  () => props.options || [],
  () => props.modelValue,
)

const translatedLabel = computed(() => {
  if (props.labelFormat) {
    return props.labelFormat(selectedItems.value)
  }

  return selectedItems.value.map((item) => item.label).join(', ')
})

const configProvider = useConfigProvider()

const computedSize = computed(() => props.size || configProvider.size)

// Single mode commits on pick and closes; multiple mode stays open and commits `change`
// once when the popover closes, so a round of toggles is one event.
const {
  selected,
  apply,
  reset,
  commit,
  clear: clearSelection,
} = useListSelection({
  modelValue: () => props.modelValue,
  multiple: () => props.multiple,
  onUpdateModelValue: (value) => emits('update:model-value', value),
  onChange: (value) => notify(value, changeDetailsFor({ reason: 'item-press' })),
  onClear: (value) => notify(value, changeDetailsFor({ reason: 'cleared' })),
})
const { onKeydown } = useListKeyboardController({
  enabled: () => popoverVisible.value,
  onCommand: (command) => listRef.value?.dispatch(command) ?? false,
  keymap: () => (props.filterable ? FILTERABLE_KEYMAP : DEFAULT_KEYMAP),
})
const { listOptions, pending, error, retry } = useListSearch(
  () => props.options ?? [],
  filterKeyword,
  {
    filterMethod: () => props.filterMethod,
    remoteFilter: () => props.remoteFilter,
  },
)

useAgentNode({
  name: 'select',
  namedBy: 'button',
  closed: true,
  owns: () => listRef.value?.$el,
  items: () => optionItems(props.options, selected.value),
  itemElement: (value) => listRef.value?.elementOf(value),
  state: () => ({
    value: selected.value ?? null,
    open: popoverVisible.value,
    multiple: props.multiple ?? false,
  }),
  pending: () => pending.value,
  error: () => error.value,
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

function onSearchInput(ev: Event) {
  filterKeyword.value = (ev.target as HTMLInputElement).value
}

function clear() {
  clearSelection()
  popoverVisible.value = false
}

function onRetry() {
  retry()
  emits('retry')
}

function onListUpdate(next: ListModelValue) {
  if (isNil(next)) {
    return
  }

  if (apply(next)) {
    popoverVisible.value = false
  }
}

watch(popoverVisible, async (visible) => {
  if (!visible) {
    filterKeyword.value = ''
    commit()
    return
  }

  reset()
  await nextTick()

  if (props.filterable) {
    searchInputRef.value?.focus({ preventScroll: true })
    return
  }

  listRef.value?.focus()
})

watch(listOptions, async () => {
  await nextTick()
  listRef.value?.setFirstAsActive()
})
</script>

<template>
  <PPopover
    data-select
    v-model="popoverVisible"
    v-bind="$attrs"
    class="pxd-select"
    trigger="click"
    match-width
    :keep-height="filterable"
    :auto-focus-element="filterable"
    :disabled="disabled"
    :content-class="POPOVER_PANEL_CLASS"
    :close-on-press-escape="closeOnPressEscape"
    @wrapper-keydown="onKeydown"
  >
    <PButton
      class="relative justify-between text-inherit"
      align="left"
      full-width
      :class="{ 'text-gray-600': !translatedLabel, 'pe-8': showClear }"
      :variant="variant"
      :shape="shape"
      :size="computedSize"
      :disabled="disabled"
      :aria-haspopup="filterable ? 'combobox' : 'listbox'"
      :aria-expanded="popoverVisible"
    >
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>

      <template v-if="translatedLabel">
        <div class="truncate">
          <slot :label="translatedLabel">{{ translatedLabel }}</slot>
        </div>
      </template>
      <template v-else>
        {{ placeholder }}
      </template>

      <template #suffix>
        <button
          v-if="showClear"
          type="button"
          data-popover-ignore
          aria-label="Clear selection"
          class="pxd-select--clear p-1 end-1.5 absolute cursor-pointer appearance-none rounded-sm font-inherit text-foreground-secondary self-focus-ring outline-none hover:bg-background-hover hover:text-foreground active:bg-background-active motion-safe:transition-colors"
          @click.stop.prevent="clear"
          @pointerdown.prevent
        >
          <CrossIcon class="size-3" />
        </button>
        <slot v-else name="suffix">
          <ChevronDownIcon
            v-if="suffixIcon && !showClear"
            class="text-sm text-foreground-secondary motion-safe:transition-transform"
            :class="{ 'rotate-180': popoverVisible }"
          />
        </slot>
      </template>
    </PButton>

    <template #content>
      <label
        v-if="filterable"
        :for="searchInputId"
        class="px-3 py-2 gap-2 flex items-center border-b bg-background-100"
      >
        <input
          :id="searchInputId"
          ref="searchInputRef"
          :value="filterKeyword"
          type="text"
          role="combobox"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          aria-autocomplete="list"
          inputmode="search"
          :aria-controls="listId"
          :aria-expanded="popoverVisible"
          :aria-disabled="disabled"
          :aria-activedescendant="listRef?.activeItemId"
          :placeholder="filterPlaceholder"
          class="pxd-select--search h-7 min-w-0 text-sm flex-1 appearance-none border-none bg-transparent font-inherit text-foreground outline-none"
          @input="onSearchInput"
          @keydown="onKeydown"
        />
      </label>

      <PList
        :id="listId"
        ref="listRef"
        :model-value="selected"
        :options="listOptions"
        :loading="pending"
        :error="Boolean(error)"
        :multiple="multiple"
        :virtual="virtual"
        :loop="!filterable"
        :default-active-index="filterable ? 0 : -1"
        class="max-h-68 min-h-0 flex-1 overflow-auto"
        @update:model-value="onListUpdate"
        @retry="onRetry"
      >
        <template v-if="$slots.item" #item="itemSlotProps">
          <slot name="item" v-bind="itemSlotProps" />
        </template>

        <template #empty>
          <slot name="empty">
            <template v-if="filterKeyword">
              {{ configProvider.locale.results.searchText }}
              <span class="whitespace-pre text-foreground">"{{ filterKeyword }}"</span>
            </template>
          </slot>
        </template>
      </PList>

      <div v-if="$slots.footer" class="pxd-select--footer p-2 border-t">
        <slot name="footer" />
      </div>
    </template>
  </PPopover>
</template>
