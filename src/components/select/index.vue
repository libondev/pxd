<script lang="ts" setup>
import type { ListKeyboardMap } from '../../composables/_internal/use-list-keyboard-controller'
import type { ListModelValue } from '../list/types'
import type { SelectEmits, SelectProps } from './types'
import type { ClassValue } from 'cn'
import type { ComponentPublicInstance } from 'vue'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import CrossIcon from '@gdsicon/vue/cross'
import { cn } from 'cn'
import { computed, nextTick, shallowRef, useAttrs, watch } from 'vue'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { changeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { useFormControl } from '../../composables/_internal/use-form-control.js'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useListSearch } from '../../composables/_internal/use-list-search.js'
import { useListSelection } from '../../composables/_internal/use-list-selection.js'
import { useSelectedListItems } from '../../composables/_internal/use-selected-list-item.js'
import { POPOVER_PANEL_CLASS } from '../../constants/popover-panel.js'
import { SIZE_TEXT_CLASS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getElement } from '../../utils/dom.js'
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
  matchWidth: true,
  searchPlaceholder: 'Search...',
})
const emits = defineEmits<SelectEmits>()

const listId = getUniqueId('select-list')
const searchInputId = getUniqueId('select-search')
const triggerId = getUniqueId('select-trigger')
const valueId = getUniqueId('select-value')
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
// While the panel is open and focus still sits on the trigger, only navigation is forwarded.
const NAVIGATION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'])

const popoverVisible = shallowRef(false)
const buttonRef = shallowRef<ComponentPublicInstance>()
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

const {
  id: controlId,
  invalid: isInvalid,
  required: isRequired,
  describedBy,
  labelId,
} = useFormControl({
  id: () => props.id,
  fallbackId: triggerId,
  invalid: () => props.invalid,
})

const attrs = useAttrs()

const rootClass = computed(() =>
  cn(
    'pxd-select relative inline-flex w-full max-w-full',
    SIZE_TEXT_CLASS[computedSize.value],
    isInvalid.value && 'is-error',
    attrs.class as ClassValue,
  ),
)

const popoverAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs

  return rest
})

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
  el: () => getElement(buttonRef),
  owns: () => getElement(listRef),
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

  // Clearing removes the control that was just pressed; focus belongs back on the trigger.
  getElement(buttonRef)?.focus()
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) {
    return
  }

  // Focus can stay on the trigger while the panel is open; the list still owns navigation.
  // Enter and Space stay native so the button cannot toggle again after a selection.
  if (popoverVisible.value) {
    if (NAVIGATION_KEYS.has(event.key)) {
      onKeydown(event)
    }

    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    popoverVisible.value = true
  }
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
  <div :class="rootClass" :style="attrs.style">
    <PPopover
      data-select
      as-child
      v-model="popoverVisible"
      aria-haspopup="listbox"
      v-bind="popoverAttrs"
      trigger="click"
      :match-width="matchWidth"
      :keep-height="filterable"
      :initial-focus="filterable"
      :disabled="disabled"
      :content-class="POPOVER_PANEL_CLASS"
      @wrapper-keydown="onKeydown"
    >
      <PButton
        ref="buttonRef"
        class="relative max-w-full justify-between [font-size:inherit]! text-inherit"
        align="left"
        full-width
        :id="controlId"
        :aria-invalid="isInvalid || undefined"
        :aria-required="isRequired || undefined"
        :aria-describedby="describedBy || undefined"
        :aria-labelledby="labelId ? `${labelId} ${valueId}` : undefined"
        :class="{ 'text-gray-600': !translatedLabel, 'pe-8': showClear }"
        :variant="variant"
        :shape="shape"
        :size="computedSize"
        :disabled="disabled"
        @keydown="onTriggerKeydown"
      >
        <template v-if="$slots.prefix" #prefix>
          <slot name="prefix" />
        </template>

        <div :id="valueId" class="truncate">
          <template v-if="translatedLabel">
            <slot :label="translatedLabel">{{ translatedLabel }}</slot>
          </template>
          <template v-else>
            {{ placeholder }}
          </template>
        </div>

        <template #suffix>
          <slot name="suffix">
            <ChevronDownIcon
              v-if="suffixIcon && !showClear"
              class="text-foreground-secondary motion-safe:transition-transform"
              :class="{ 'rotate-180': popoverVisible }"
            />
          </slot>
        </template>
      </PButton>

      <template #content>
        <label
          v-if="filterable"
          :for="searchInputId"
          class="px-2.5 py-1.5 gap-2 flex items-center border-b bg-background-100"
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
            :placeholder="searchPlaceholder"
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
          :failed="Boolean(error)"
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

    <button
      v-if="showClear"
      type="button"
      :aria-label="configProvider.locale.interaction.clearSelection"
      class="pxd-select--clear p-1 end-2 absolute top-1/2 z-1 -translate-y-1/2 cursor-pointer appearance-none rounded-sm font-inherit text-foreground-secondary self-focus-ring outline-none hover:bg-background-hover hover:text-foreground active:bg-background-active motion-safe:transition-colors"
      @click.stop.prevent="clear"
      @pointerdown.prevent
    >
      <CrossIcon class="size-3" />
    </button>
  </div>
</template>

<style lang="postcss">
.pxd-select.is-error {
  .pxd-button:not(.is-disabled) {
    border-color: hsl(var(--color-red-900-value));
  }

  .pxd-button:not(.is-disabled):focus-visible {
    outline-color: hsl(var(--color-red-900-value));
  }
}
</style>
