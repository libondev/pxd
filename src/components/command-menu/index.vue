<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import { nextTick, shallowRef } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { useDeferredValue } from '../../composables/use-deferred-value'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from '../../composables/use-media-query'
import { useModelValue } from '../../composables/use-model-value'
import { provideListFilterValue } from '../../contexts/list'
import { getUniqueId } from '../../utils/uid'
import PButton from '../button/index.vue'
import PList from '../list/index.vue'
import PModal from '../modal/index.vue'
import type { CommandMenuEmits, CommandMenuProps } from './types'

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

const isDesktop = useMediaQuery(PRESET_MEDIA_QUERIES.SM_UP)

const listRef = shallowRef<InstanceType<typeof PList>>()

const isEmptyResult = shallowRef(false)

const { value: filterKeyword, deferred: deferredFilterKeyword } = useDeferredValue('', {
  async valueChange(v: string) {
    if (!v) {
      return
    }

    await nextTick()

    listRef.value!.updateListItem()
    listRef.value!.setFirstAsActive()
    isEmptyResult.value = listRef.value!.isNoVisibleItem()
  },
})

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

function onListItemSelect(ev: MouseEvent, item: ListOptionSelected) {
  emits('select', ev, item)

  if (props.closeOnSelectItem) {
    closeModal()
  }
}

provideListFilterValue(deferredFilterKeyword)
</script>

<template>
  <PModal
    v-model="modelValue"
    width="640px"
    class="pxd-command-menu max-sm:dvh-80"
    content-class="!p-0 overflow-hidden"
    wrapper-class="sm:top-1/8 sm:translate-y-0"
    :auto-focus-element="isDesktop"
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

        <PButton
          v-if="closeOnPressEscape"
          size="xs"
          class="px-0! text-xs shrink-0"
          @click="closeModal"
        >
          Esc
        </PButton>
      </label>
    </template>

    <PList
      ref="listRef"
      :loop="false"
      class="sm:max-h-110 h-full"
      :toggle-on-key-press="modelValue"
      @select="onListItemSelect"
    >
      <slot />

      <p v-if="isEmptyResult" class="py-7.5 text-sm text-center text-foreground-secondary">
        {{ configProvider.locale.empty.search }}
        <span class="text-foreground">"{{ filterKeyword }}"</span>
      </p>
    </PList>

    <slot name="footer" />
  </PModal>
</template>
