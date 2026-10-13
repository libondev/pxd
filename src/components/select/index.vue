<script lang="ts" setup>
import type { ListKeyboardMap } from '../../composables/_internal/use-list-keyboard-controller'
import type { ListModelValue, ListOptions } from '../list/types'
import type { SelectEmits, SelectProps } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import { computed, nextTick, shallowRef, watch } from 'vue'
import { useListFilter } from '../../composables/_internal/use-list-filter.js'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useListSelection } from '../../composables/_internal/use-list-selection.js'
import { usePopoverResponsive } from '../../composables/_internal/use-popover-responsive.js'
import { useSelectedListItems } from '../../composables/_internal/use-selected-list-item.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getUniqueId } from '../../utils/helper.js'
import { isNil } from '../../utils/is.js'
import PButton from '../button/index.vue'
import PList from '../list/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PSelect',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<SelectProps>(), {
  suffixIcon: true,
})
const emits = defineEmits<SelectEmits>()

// Resolved from the full options so a selected item that the filter drops still has a label.
const selectedItems = useSelectedListItems(
  () => props.options || [],
  () => props.modelValue,
)
const configProvider = useConfigProvider()
const { isAdaptive, responsiveClasses } = usePopoverResponsive()

const listId = getUniqueId('select-list')
const searchInputId = getUniqueId('select-search')

const popoverVisible = shallowRef(false)
const listRef = shallowRef<InstanceType<typeof PList>>()
const searchInputRef = shallowRef<HTMLInputElement>()

const filterKeyword = shallowRef('')
const { filteredOptions } = useListFilter(() => props.options ?? [], filterKeyword)

const listOptions = computed<ListOptions>(() =>
  props.filterable ? filteredOptions.value : (props.options ?? []),
)

const computedSize = computed(() => props.size || configProvider.size)

// Single mode commits on pick and closes; multiple mode stays open and commits `change`
// once when the popover closes, so a round of toggles is one event.
const { selected, apply, reset, commit } = useListSelection(props, emits)

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

const { onKeydown } = useListKeyboardController({
  enabled: () => popoverVisible.value,
  onCommand: (command) => listRef.value?.dispatch(command) ?? false,
  keymap: () => (props.filterable ? FILTERABLE_KEYMAP : DEFAULT_KEYMAP),
})

const translatedLabel = computed(() => {
  if (props.labelFormat) {
    return props.labelFormat(selectedItems.value)
  }

  return selectedItems.value.map((item) => item.label).join(', ')
})

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

function onSearchInput(ev: Event) {
  filterKeyword.value = (ev.target as HTMLInputElement).value
}

function onListUpdate(next: ListModelValue) {
  if (isNil(next)) {
    return
  }

  if (apply(next)) {
    popoverVisible.value = false
  }
}
</script>

<template>
  <PPopover
    data-select
    v-model="popoverVisible"
    class="pxd-select"
    trigger="click"
    position="bottom"
    :auto-focus-element="filterable"
    :disabled="disabled"
    :adaptive="isAdaptive"
    :wrapper-class="responsiveClasses.wrapper"
    :content-class="responsiveClasses.content"
    :lock-scroll-on-visible="isAdaptive"
    :close-on-press-escape="closeOnPressEscape"
    v-bind="$attrs"
    @wrapper-keydown="onKeydown"
  >
    <PButton
      class="px-1.5 justify-between"
      align="left"
      full-width
      :class="{ 'text-gray-600': !translatedLabel }"
      :variant="variant"
      :shape="shape"
      :size="computedSize"
      :disabled="disabled"
    >
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>

      <template v-if="translatedLabel">
        <slot :label="translatedLabel">{{ translatedLabel }}</slot>
      </template>
      <template v-else>
        {{ placeholder }}
      </template>

      <template v-if="suffixIcon" #suffix>
        <ChevronDownIcon
          class="text-sm me-1.5 text-foreground-secondary motion-safe:transition-transform"
          :class="{ 'rotate-180': popoverVisible }"
        />
      </template>
    </PButton>

    <template #content>
      <label
        v-if="filterable"
        :for="searchInputId"
        class="px-3 py-2 flex items-center border-b bg-background-100"
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
        :multiple="multiple"
        :virtual="virtual"
        :loop="!filterable"
        :default-active-index="filterable ? 0 : -1"
        class="max-h-68 min-h-0 flex-1"
        @update:model-value="onListUpdate"
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
    </template>
  </PPopover>
</template>
