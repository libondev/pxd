<script lang="ts" setup>
import type { ListOptions } from '../list/types'
import type { CommandMenuEmits, CommandMenuProps } from './types'
import { computed, nextTick, shallowRef, watch } from 'vue'
import { useListFilter } from '../../composables/_internal/use-list-filter.js'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useListSearch } from '../../composables/_internal/use-list-search.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from '../../composables/use-media-query.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getUniqueId } from '../../utils/helper.js'
import PList from '../list/index.vue'
import PModal from '../modal/index.vue'

defineOptions({
  name: 'PCommandMenu',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:model-value',
  },
})

const props = withDefaults(defineProps<CommandMenuProps>(), {
  width: '40rem',
  modelValue: false,
  placeholder: '',
  closeOnSelectItem: true,
  closeOnPressEscape: true,
  closeOnClickOverlay: true,
})

const emits = defineEmits<CommandMenuEmits>()

const uniqueId = getUniqueId()

const filterKeyword = shallowRef('')
const listRef = shallowRef<InstanceType<typeof PList>>()

const configProvider = useConfigProvider()
const modelValue = useModelValue(props, emits)
const isSmallScreen = useMediaQuery(PRESET_MEDIA_QUERIES.IS_XS)
const { filteredOptions } = useListFilter(() => props.options ?? [], filterKeyword, {
  filter: () => props.filterMethod,
})
const { matches, pending, active } = useListSearch({
  query: filterKeyword,
  remoteFilter: () => props.remoteFilter,
})

const listOptions = computed<ListOptions>(() =>
  active.value ? (matches.value ?? []) : filteredOptions.value,
)

const { onKeydown: onListKeydown } = useListKeyboardController({
  enabled: () => modelValue.value,
  onCommand: (command) => listRef.value?.dispatch(command) ?? false,
  keymap: {
    ArrowDown: 'next',
    ArrowUp: 'previous',
    Enter: 'activate',
    Home: 'first',
    End: 'last',
  },
})

function onModalKeydown(ev: KeyboardEvent) {
  // On small screens the modal wrapper owns the focus, not the input.
  if (ev.target === ev.currentTarget) {
    onListKeydown(ev)
  }
}

function hideModal() {
  filterKeyword.value = ''
  emits('hide')
}

function showModal() {
  emits('show')
}

function closeModal() {
  modelValue.value = false
}

function onListItemSelect() {
  if (props.closeOnSelectItem) {
    closeModal()
  }
}

function onInputKeyword(event: Event) {
  const input = event.target as HTMLInputElement
  filterKeyword.value = input.value.replaceAll("'", '')
}

watch(listOptions, async () => {
  await nextTick()
  listRef.value?.setFirstAsActive()
})
</script>

<template>
  <PModal
    data-command-menu
    v-model="modelValue"
    :width="width"
    class="pxd-command-menu max-sm:h-full"
    content-class="!p-0 overflow-hidden"
    wrapper-class="sm:top-1/8 sm:translate-y-0"
    :auto-focus-element="!isSmallScreen"
    :close-on-press-escape="closeOnPressEscape"
    :close-on-click-overlay="closeOnClickOverlay"
    v-bind="$attrs"
    @keydown="onModalKeydown"
    @show="showModal"
    @hide="hideModal"
  >
    <template #header>
      <label
        :for="uniqueId"
        class="px-4 py-3 -mx-5 -mbs-5 gap-2 flex items-center border-b bg-background-100"
      >
        <input
          :id="uniqueId"
          :value="filterKeyword"
          :placeholder="placeholder"
          aria-autocomplete="list"
          :aria-controls="uniqueId"
          :aria-labelledby="uniqueId"
          role="combobox"
          aria-expanded="true"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          type="text"
          name="command-menu-filter-input"
          class="h-7 flex-1 shrink-0 appearance-none border-none bg-transparent font-inherit text-foreground outline-none"
          @input="onInputKeyword"
          @keydown="onListKeydown"
        />

        <button
          type="button"
          class="px-1.5 h-5 text-xs shrink-0 cursor-pointer appearance-none rounded-sm border bg-background-100 self-focus-ring hover:bg-background-hover active:bg-background-active motion-safe:transition-colors"
          @click="closeModal"
        >
          <kbd class="appearance-none font-sans">Esc</kbd>
        </button>
      </label>
    </template>

    <PList
      ref="listRef"
      :virtual="virtual"
      :options="listOptions"
      :loading="pending"
      :default-active-index="0"
      class="sm:max-h-110 h-full"
      @change="onListItemSelect"
    >
      <template v-if="$slots.item" #item="itemSlotProps">
        <slot name="item" v-bind="itemSlotProps" />
      </template>

      <template #empty>
        {{ configProvider.locale.results.searchText }}
        <span class="whitespace-pre text-foreground">"{{ filterKeyword }}"</span>
      </template>
    </PList>

    <slot name="footer" />
  </PModal>
</template>
