<script lang="ts" setup>
import type { ListOptionSelected } from '../../types/components/list'
import { nextTick, shallowRef } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { useModelValue } from '../../composables/use-model-value'
import { provideListFilterValue } from '../../contexts/list'
import { debounce } from '../../utils/debounce'
import { throttle } from '../../utils/throttle'
import { getUniqueId } from '../../utils/uid'
import PButton from '../button/index.vue'
import PList from '../list/index.vue'
import PModal from '../modal/index.vue'

interface Props {
  width?: string | number
  modelValue?: boolean
  placeholder?: string
  closeOnSelectItem?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
}

defineOptions({
  name: 'PCommandMenu',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: false,
    placeholder: '',
    closeOnSelectItem: true,
    closeOnPressEscape: true,
    closeOnClickOverlay: true,
  },
)

const emits = defineEmits<{
  'update:modelValue': [boolean]
  'select': [MouseEvent, ListOptionSelected]
  'show': []
  'hide': []
}>()

const uniqueId = getUniqueId()

const config = useConfigProvider()
const modelValue = useModelValue(props, emits)

const listRef = shallowRef<InstanceType<typeof PList>>()

const filterKeyword = shallowRef('')
const isEmptyResult = shallowRef(false)

const onKeywordChange = throttle(async (ev: Event) => {
  const inputValue = (ev.target as HTMLInputElement).value.trim()

  filterKeyword.value = inputValue

  const list = listRef.value

  if (!list) {
    return
  }

  await nextTick()
  list.updateListItem()
  list.setActiveValueToFirst()
  isEmptyResult.value = list.isNoVisibleItem()
}, 200, { edges: ['leading', 'trailing'] })

const hideModal = debounce(() => {
  modelValue.value = false
  filterKeyword.value = ''
  emits('hide')
}, 500, { edges: ['leading'] })

function showModal() {
  emits('show')
}

function onListItemSelect(ev: MouseEvent, item: ListOptionSelected) {
  emits('select', ev, item)

  if (props.closeOnSelectItem) {
    hideModal()
  }
}

provideListFilterValue(filterKeyword)
</script>

<template>
  <PModal
    v-model="modelValue"
    width="640px"
    class="pxd-command-menu"
    content-class="!p-0 overflow-hidden"
    wrapper-class="sm:top-1/6 sm:translate-y-0"
    :close-on-press-escape="closeOnPressEscape"
    :close-on-click-overlay="closeOnClickOverlay"
    @show="showModal"
    @hide="hideModal"
  >
    <template #header>
      <label :for="uniqueId" class="py-3 px-4 -mx-6 -my-4 gap-3 flex items-center border-b bg-background-100">
        <input
          :id="uniqueId"
          :value="filterKeyword"
          :placeholder="placeholder"
          aria-autocomplete="list"
          :aria-controls="uniqueId"
          :aria-labelledby="uniqueId"
          aria-expanded="true"
          autocomplete="off"
          autocorrect="off"
          role="combobox"
          spellcheck="false"
          type="text"
          name="command-menu-filter-input"
          class="h-7 flex-1 appearance-none border-none bg-transparent text-foreground outline-none"
          @input="onKeywordChange"
        >

        <PButton
          v-if="closeOnPressEscape"
          size="xs"
          class="!px-0 text-xs shrink-0"
          @click="hideModal"
        >
          Esc
        </PButton>
      </label>
    </template>

    <PList
      ref="listRef"
      :loop="false"
      class="sm:h-auto sm:max-h-110 h-[70vh]"
      :item-transition="false"
      :key-listener="modelValue"
      @select="onListItemSelect"
    >
      <slot />

      <p v-if="isEmptyResult" class="py-7.5 text-sm text-center text-foreground-secondary">
        {{ config.locale.empty.search }} <span class="text-foreground">"{{ filterKeyword }}"</span>
      </p>
    </PList>

    <slot name="footer" />
  </PModal>
</template>
