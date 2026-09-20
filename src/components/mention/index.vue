<script lang="ts" setup>
import type { ListOptionSelected } from '../list/types'
import type { MentionEmits, MentionProps } from './types'
import { computed, nextTick, shallowRef } from 'vue'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useMentionSuggest } from '../../composables/_internal/use-mention-suggest.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { usePopoverResponsive } from '../../composables/_internal/use-popover-responsive.js'
import { useToggleValue } from '../../composables/use-toggle-value.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { raf } from '../../utils/event.js'
import { getUniqueId } from '../../utils/helper.js'
import PMentionEditor from '../_internal/mention-editor.vue'
import PList from '../list/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PMention',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<MentionProps>(), {
  modelValue: '',
  options: () => [],
  placeholder: '',
  searchPlaceholder: '',
  disabled: false,
  closeOnPressEscape: true,
})

const emits = defineEmits<MentionEmits>()

const modelValue = useModelValue(props, emits)
const configProvider = useConfigProvider()
const { isAdaptive, responsiveClasses } = usePopoverResponsive()

const listId = getUniqueId('mention-list')
const searchInputId = getUniqueId('mention-search')

const { value: popoverVisible, toggle: togglePopoverVisible } = useToggleValue(false)
const editorRef = shallowRef<InstanceType<typeof PMentionEditor>>()
const listRef = shallowRef<InstanceType<typeof PList>>()
const searchInputRef = shallowRef<HTMLInputElement>()

const {
  filterKeyword,
  listOptions,
  isPending,
  isEmptyResult,
  open: openSuggest,
  close: closeSuggest,
  setKeyword,
} = useMentionSuggest({
  getOptions: () => props.options,
  getFilterMethod: () => props.filterMethod,
  isDisabled: () => props.disabled,
  visible: popoverVisible,
  setVisible: (visible) => togglePopoverVisible(visible),
})

const computedSize = computed(() => props.size || configProvider.size)

const { onKeydown: onSearchKeydown } = useListKeyboardController({
  enabled: () => popoverVisible.value && !isPending.value,
  onCommand: (command) => listRef.value?.dispatch(command) ?? false,
  keymap: {
    ArrowDown: 'next',
    ArrowUp: 'previous',
    Enter: 'activate',
    Home: 'first',
    End: 'last',
  },
})

async function focusSearchInput() {
  await nextTick()

  searchInputRef.value?.focus({ preventScroll: true })
}

function onPopoverShow() {
  focusSearchInput()
}

function onPopoverHide() {
  // Must wait until focus-trap finishes deactivating; sync focus is pulled back into the trap.
  editorRef.value?.restoreCaret(true)
}

function onSearchInput(ev: Event) {
  setKeyword((ev.target as HTMLInputElement).value)
}

function onSearchKeydownWithEscape(ev: KeyboardEvent) {
  if (ev.key === 'Escape' && props.closeOnPressEscape) {
    ev.preventDefault()
    ev.stopPropagation()
    closeSuggest()
    return
  }

  onSearchKeydown(ev)
}

function onOptionSelect(item: ListOptionSelected) {
  if (isPending.value) {
    return
  }

  const key = String(item.value ?? '')
  const label = String(item.label ?? key)

  if (!key) {
    return
  }

  const inserted = editorRef.value?.insertMention(key, label)

  if (inserted) {
    closeSuggest()
  }
}

function onMentionClick(payload: { key: string; label: string; event: MouseEvent }) {
  emits('mention-click', payload)
}
</script>

<template>
  <PPopover
    v-model="popoverVisible"
    class="pxd-mention w-full max-w-full"
    position="bottom-start"
    :trigger="[]"
    :auto-focus-element="true"
    :return-focus-on-deactivate="false"
    fill-trigger-width
    :disabled="disabled"
    :adaptive="isAdaptive"
    :wrapper-class="responsiveClasses.wrapper"
    :content-class="responsiveClasses.content"
    :lock-scroll-on-visible="isAdaptive"
    :close-on-press-escape="closeOnPressEscape"
    v-bind="$attrs"
    @show="onPopoverShow"
    @hide="onPopoverHide"
  >
    <div
      class="pxd-mention--field relative w-full max-w-full rounded-md bg-background-100"
      :class="{ 'is-disabled': disabled }"
      :data-disabled="disabled"
    >
      <PMentionEditor
        ref="editorRef"
        v-model="modelValue"
        :size="computedSize"
        class="rounded-inherit"
        :placeholder="placeholder"
        :disabled="disabled"
        @trigger="openSuggest"
        @mention-click="onMentionClick"
      />
    </div>

    <template #content>
      <div
        class="pxd-mention--suggest max-h-80 min-w-56 flex flex-col overflow-hidden rounded-inherit"
      >
        <label :for="searchInputId" class="px-3 py-2 gap-2 flex items-center bg-background-100">
          <input
            :id="searchInputId"
            ref="searchInputRef"
            :value="filterKeyword"
            type="search"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            role="combobox"
            aria-autocomplete="list"
            :aria-controls="listId"
            :aria-expanded="popoverVisible"
            :aria-disabled="isPending || undefined"
            :placeholder="searchPlaceholder"
            class="h-7 min-w-0 text-sm flex-1 appearance-none border-none bg-transparent font-inherit text-foreground outline-none"
            @input="onSearchInput"
            @keydown="onSearchKeydownWithEscape"
          />

          <button
            type="button"
            class="px-1.5 h-5 text-xs shrink-0 cursor-pointer appearance-none rounded-sm border bg-background-100 self-focus-ring hover:bg-background-hover active:bg-background-active motion-safe:transition-colors"
            @click="closeSuggest"
          >
            <kbd class="appearance-none font-sans">Esc</kbd>
          </button>
        </label>

        <PList
          :id="listId"
          ref="listRef"
          role="listbox"
          :loop="false"
          :options="listOptions"
          :empty="isEmptyResult"
          :default-active-index="0"
          :visible="popoverVisible"
          class="max-h-68 min-h-0 flex-1 rounded-none border-t"
          :class="{ 'pointer-events-none opacity-60': isPending }"
          @change="onOptionSelect"
        >
          <template v-if="$slots.item" #item="itemSlotProps">
            <slot name="item" v-bind="itemSlotProps" />
          </template>

          <template #empty>
            <slot name="empty">
              {{ configProvider.locale.results.searchText }}
              <span class="whitespace-pre text-foreground">"{{ filterKeyword }}"</span>
            </slot>
          </template>
        </PList>
      </div>
    </template>
  </PPopover>
</template>
