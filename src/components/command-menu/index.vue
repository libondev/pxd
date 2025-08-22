<script lang="ts" setup>
import type { ListOption, ListOptionSelected } from '../../types/components/list'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { provideCommandMenuContext } from '../../contexts/command-menu'
import { debounce } from '../../utils/debounce'
import { throttle } from '../../utils/throttle'
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

const modelValue = useModelValue(props, emits)

const allItems = new Set<ListOption>()
const filterKeyword = shallowRef('')

const matchFilterResult = computed(() => {
  return filterKeyword.value
})

const onKeywordChange = throttle((ev: Event) => {
  const inputValue = (ev.target as HTMLInputElement).value.trim()

  if (filterKeyword.value === inputValue) {
    return
  }

  filterKeyword.value = inputValue
}, 200, { edges: ['leading', 'trailing'] })

const closeModal = debounce(() => {
  modelValue.value = false
  filterKeyword.value = ''
  emits('hide')
}, 500, { edges: ['leading'] })

function onShowModal() {
  emits('show')
}

function onListItemSelect(ev: MouseEvent, item: ListOptionSelected) {
  emits('select', ev, item)

  if (props.closeOnSelectItem) {
    closeModal()
  }
}

function registerCommandMenuItem(data: ListOption) {
  allItems.add(data)
}

function unregisterCommandMenuItem(data: ListOption) {
  allItems.delete(data)
}

provideCommandMenuContext({
  registerCommandMenuItem,
  unregisterCommandMenuItem,
})

onBeforeUnmount(() => {
  allItems.clear()
})
</script>

<template>
  <PModal
    v-model="modelValue"
    width="640px"
    class="pxd-command-menu"
    content-class="!p-0 max-h-110"
    wrapper-class="sm:top-1/6 sm:translate-y-0"
    :close-on-press-escape="closeOnPressEscape"
    :close-on-click-overlay="closeOnClickOverlay"
    @show="onShowModal"
    @hide="closeModal"
  >
    <template #header>
      <div class="py-3 px-4 -mx-6 -my-4 gap-3 flex items-center border-b">
        <input
          :value="filterKeyword"
          :placeholder="placeholder"
          class="h-7 flex-1 appearance-none border-none bg-transparent text-foreground outline-none"
          @input="onKeywordChange"
        >

        <PButton
          v-if="closeOnPressEscape"
          size="xs"
          class="!px-0 text-xs shrink-0"
          @click="closeModal"
        >
          Esc
        </PButton>
      </div>
    </template>

    <PList
      v-if="filterKeyword"
      :item-transition="false"
      :key-listener="modelValue"
      @select="onListItemSelect"
    >
      <template v-if="matchFilterResult.length">
        112
      </template>

      <template v-else>
        <p class="py-7.5 text-sm text-center text-foreground-secondary">
          No results found for <span class="text-foreground">{{ filterKeyword }}</span>
        </p>
      </template>
    </PList>

    <PList
      v-else
      :item-transition="false"
      :key-listener="modelValue && !filterKeyword"
      @select="onListItemSelect"
    >
      <slot />
    </PList>

    <slot name="footer" />
  </PModal>
</template>
