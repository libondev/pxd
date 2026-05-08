<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import type { CommandMenuEmits, CommandMenuProps } from './types'
import { computed, shallowRef } from 'vue'
import { useListFilter } from '../../composables/use-list-filter'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from '../../composables/use-media-query'
import { useModelValue } from '../../composables/use-model-value'
import { useConfigProvider } from '../../contexts/config-provider'
import { provideListFilterContext } from '../../contexts/list'
import { getUniqueId } from '../../utils/uid'
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
        class="py-3 px-4 -mx-6 -mt-4 sm:-mt-6 gap-3 flex items-center border-b bg-background-100"
      >
        <input
          :id="uniqueId"
          v-model="filterKeyword"
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
        />

        <button
          type="button"
          class="px-1.5 h-5 text-xs shrink-0 cursor-pointer appearance-none rounded-sm border bg-background-100 self-focus-ring hover:bg-background-hover active:bg-background-active motion-safe:transition-colors"
          @click="closeModal"
        >
          Esc
        </button>
      </label>
    </template>

    <PList
      :loop="false"
      class="sm:max-h-110 h-full"
      :empty="!!filterKeyword && isEmptyResult"
      :default-active-index="0"
      :toggle-on-key-press="modelValue"
      @select="onListItemSelect"
    >
      <slot />

      <template #empty>
        {{ configProvider.locale.results.searchText }}
        <span class="whitespace-pre text-foreground">"{{ filterKeyword }}"</span>
      </template>
    </PList>

    <slot name="footer" />
  </PModal>
</template>
