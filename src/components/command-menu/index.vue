<script lang="ts" setup>
import { shallowRef } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { throttle } from '../../utils/throttle'
import PButton from '../button/index.vue'
import PModal from '../modal/index.vue'

interface Props {
  width?: string | number
  modelValue?: boolean
  placeholder?: string
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
    placeholder: 'Search...',
  },
)

const emits = defineEmits<{
  'update:modelValue': [boolean]
}>()

const modelValue = useModelValue(props, emits)

const searchKeyword = shallowRef('')

function onModalClose() {
  modelValue.value = false
  searchKeyword.value = ''
}

const onSearchKeywordChange = throttle((ev: Event) => {
  const targetValue = (ev.target as HTMLInputElement).value
  searchKeyword.value = targetValue
}, 255, { edges: ['leading', 'trailing'] })
</script>

<template>
  <PModal
    v-model="modelValue"
    class="pxd-command-menu"
    modal-class="sm:top-1/5"
    width="640px"
    close-on-press-escape
    close-on-click-overlay
    @close="onModalClose"
  >
    <template #header>
      <div class="py-3 px-4 -mx-6 -my-4 gap-3 flex items-center border-b">
        <input
          :value="searchKeyword"
          :placeholder="placeholder"
          class="h-7 flex-1 appearance-none border-none bg-transparent text-foreground outline-none"
          @input="onSearchKeywordChange"
        >

        <PButton size="xs" class="!px-0 text-xs" @click="onModalClose">
          Esc
        </PButton>
      </div>
    </template>

    <div class="-mx-6 -mb-5 p-2 max-h-110" />
  </PModal>
</template>
