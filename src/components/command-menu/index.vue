<script lang="ts" setup>
import type { ListNavigationCommand } from '../../composables/_internal/use-list-navigation'
import type { ListOptionSelected } from '../list/types'
import type { CommandMenuEmits, CommandMenuProps } from './types'
import { computed, shallowRef } from 'vue'
import { useListFilter } from '../../composables/_internal/use-list-filter.js'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from '../../composables/use-media-query.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { provideListFilterContext } from '../../contexts/list.js'
import { getUniqueId } from '../../utils/helper.js'
import PList from '../list/index.vue'
import PModal from '../modal/index.vue'

defineOptions({
  name: 'PCommandMenu',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<CommandMenuProps>(), {
  modelValue: false,
  placeholder: '',
  closeOnSelectItem: true,
  closeOnPressEscape: true,
  closeOnClickOverlay: true,
})

const emits = defineEmits<CommandMenuEmits>()

const uniqueId = getUniqueId()

const configProvider = useConfigProvider()
const modelValue = useModelValue(props, emits)

const filterKeyword = shallowRef('')
const filterContext = useListFilter({ keyword: filterKeyword })
const listRef = shallowRef<InstanceType<typeof PList>>()
const { onKeydown: onListKeydown } = useListKeyboardController({
  enabled: () => modelValue.value,
  onCommand: (command) => listRef.value?.dispatch(command) ?? false,
  keymap: {
    ArrowDown: 'next',
    ArrowUp: 'previous',
    Enter: 'activate',
  },
})
const isSmallScreen = useMediaQuery(PRESET_MEDIA_QUERIES.IS_XS)

const isEmptyResult = computed(
  () => !!filterKeyword.value && filterContext.visibleCount.value === 0,
)

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

function onListItemSelect(item: ListOptionSelected, ev: MouseEvent) {
  emits('select', item, ev)

  if (props.closeOnSelectItem) {
    closeModal()
  }
}

function onInputKeyword(event: Event) {
  const input = event.target as HTMLInputElement
  filterKeyword.value = input.value.replaceAll("'", '')
}

provideListFilterContext(filterContext)
</script>

<template>
  <PModal
    v-model="modelValue"
    width="640px"
    class="pxd-command-menu max-sm:h-full"
    content-class="!p-0 overflow-hidden"
    wrapper-class="sm:top-1/8 sm:translate-y-0"
    :auto-focus-element="!isSmallScreen"
    :close-on-press-escape="closeOnPressEscape"
    :close-on-click-overlay="closeOnClickOverlay"
    v-bind="$attrs"
    @show="showModal"
    @hide="hideModal"
  >
    <template #header>
      <label
        :for="uniqueId"
        class="py-3 px-4 -mx-6 -mbs-4 sm:-mbs-6 gap-3 flex items-center border-b bg-background-100"
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
      :loop="false"
      :options="options"
      class="sm:max-h-110 h-full"
      :empty="!!filterKeyword && isEmptyResult"
      :default-active-index="0"
      @select="onListItemSelect"
    >
      <template v-if="$slots.group" #group="{ group, index }">
        <slot name="group" :group="group" :index="index" />
      </template>

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
