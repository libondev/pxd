<script lang="ts" setup>
import type { ListOptionCallbackParams } from '../../types/components/list'
import { shallowRef } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
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
  'select': ListOptionCallbackParams
  'show': []
  'hide': []
}>()

const modelValue = useModelValue(props, emits)

const searchKeyword = shallowRef('')

const onKeywordChange = throttle((ev: Event) => {
  const targetValue = (ev.target as HTMLInputElement).value
  searchKeyword.value = targetValue.trim()
}, 200, { edges: ['leading', 'trailing'] })

const closeModal = debounce(() => {
  modelValue.value = false
  searchKeyword.value = ''
  emits('hide')
}, 500, { edges: ['leading'] })

function onShowModal() {
  emits('show')
}

function onListItemSelect(...args: ListOptionCallbackParams) {
  emits('select', ...args)

  if (props.closeOnSelectItem) {
    closeModal()
  }
}
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
          :value="searchKeyword"
          :placeholder="placeholder"
          class="h-7 flex-1 appearance-none border-none bg-transparent text-foreground outline-none"
          @input="onKeywordChange"
        >

        <PButton
          v-if="closeOnPressEscape"
          size="xs"
          class="!px-0 text-xs"
          @click="closeModal"
        >
          Esc
        </PButton>
      </div>
    </template>

    <PList
      :item-transition="false"
      :key-listener="modelValue"
      @select="onListItemSelect"
    >
      <slot />
    </PList>

    <slot name="footer" />
  </PModal>
</template>
