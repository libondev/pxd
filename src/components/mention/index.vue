<script lang="ts" setup>
import type { ListOptionSelected, ListOptions } from '../list/types'
import type { MentionClickPayload, MentionEmits, MentionProps, MentionSelectPayload } from './types'
import { computed, nextTick, shallowRef, watch } from 'vue'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useMentionSuggest } from '../../composables/_internal/use-mention-suggest.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { usePopoverResponsive } from '../../composables/_internal/use-popover-responsive.js'
import { useToggleValue } from '../../composables/use-toggle-value.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { DEFAULT_TRIGGER } from '../../utils/_internal/mention-html.js'
import { isCompositionKeydown } from '../../utils/event.js'
import { getUniqueId } from '../../utils/helper.js'
import PMentionEditor from '../_internal/mention-editor.vue'
import PList from '../list/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PMention',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:model-value',
  },
})

const props = withDefaults(defineProps<MentionProps>(), {
  modelValue: '',
  options: () => [],
  triggers: () => [DEFAULT_TRIGGER],
  placeholder: '',
  searchPlaceholder: '',
  filterDebounce: true,
  disabled: false,
  closeOnPressEscape: true,
  submitOnEnter: true,
  rows: 1,
  autoGrow: true,
})

const emits = defineEmits<MentionEmits>()

const listId = getUniqueId('mention-list')
const searchInputId = getUniqueId('mention-search')

const editorRef = shallowRef<InstanceType<typeof PMentionEditor>>()
const listRef = shallowRef<InstanceType<typeof PList>>()
const searchInputRef = shallowRef<HTMLInputElement>()

const modelValue = useModelValue(props, emits)
const configProvider = useConfigProvider()

const computedSize = computed(() => props.size || configProvider.size)

const { isAdaptive, responsiveClasses } = usePopoverResponsive()
const { value: popoverVisible, toggle: togglePopoverVisible } = useToggleValue(false)

const {
  activeTrigger,
  filterKeyword,
  listOptions,
  isPending,
  isEmptyResult,
  open: openSuggest,
  close: closeSuggest,
  setKeyword,
} = useMentionSuggest({
  getOptions: resolveOptions,
  getFilterMethod: () => props.filterMethod,
  isFilterDebounced: () => props.filterDebounce,
  isDisabled: () => props.disabled,
  visible: popoverVisible,
  setVisible: (visible) => togglePopoverVisible(visible),
})

const shouldRenderList = computed(
  () => listOptions.value.length > 0 || isPending.value || isEmptyResult.value,
)

const { onKeydown: onListKeydown } = useListKeyboardController({
  enabled: () => popoverVisible.value && !isPending.value,
  onCommand: (command) => listRef.value?.dispatch(command) ?? false,
  keymap: {
    ArrowDown: 'next',
    ArrowUp: 'previous',
    Enter: 'activate',
    Tab: 'activate',
    Home: 'first',
    End: 'last',
  },
})

function resolveOptions(trigger: string): ListOptions | Promise<ListOptions> {
  return typeof props.options === 'function' ? props.options(trigger) : props.options
}
async function focusSearchInput() {
  await nextTick()

  searchInputRef.value?.focus({ preventScroll: true })
}

function onPopoverShow() {
  focusSearchInput()
}

function onPopoverHide() {
  // Must wait until focus-trap finishes deactivating; sync focus is pulled back into the trap.
  editorRef.value?.restoreCaret()
}

function onSearchInput(ev: Event) {
  setKeyword((ev.target as HTMLInputElement).value)
}

function onSearchKeydownWithEscape(ev: KeyboardEvent) {
  if (ev.key === 'Escape' && props.closeOnPressEscape && !isCompositionKeydown(ev)) {
    ev.preventDefault()
    ev.stopPropagation()
    closeSuggest()
    return
  }

  onListKeydown(ev)
}

function onEditorSubmit(html: string) {
  if (popoverVisible.value) {
    return
  }

  emits('submit', html)
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

  const payload: MentionSelectPayload = {
    key,
    label,
    trigger: activeTrigger.value || DEFAULT_TRIGGER,
    item,
  }

  emits('select', payload)

  if (props.beforeInsert?.(payload) === false) {
    closeSuggest()
    return
  }

  const inserted = editorRef.value?.insertMention(key, label, payload.trigger)

  if (inserted) {
    closeSuggest()
  }
}

function onMentionClick(payload: MentionClickPayload) {
  emits('mention-click', payload)
}

watch(listOptions, async () => {
  await nextTick()
  listRef.value?.setFirstAsActive()
})

defineExpose({
  focus: () => editorRef.value?.focus(),
  blur: () => editorRef.value?.blur(),
  clear: () => editorRef.value?.clear(),
  setText: (text: string) => editorRef.value?.setText(text),
  insertText: (text: string) => editorRef.value?.insertText(text),
  insertMention: (key: string, label: string, trigger?: string) =>
    editorRef.value?.insertMention(key, label, trigger),
  replaceQuery: (text: string) => editorRef.value?.replaceQuery(text),
  openSuggest: (trigger?: string) => openSuggest(trigger ?? props.triggers[0] ?? DEFAULT_TRIGGER),
  closeSuggest,
})
</script>

<template>
  <PPopover
    data-mention
    v-model="popoverVisible"
    class="w-full"
    position="bottom-start"
    :trigger="[]"
    auto-focus-element
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
    <PMentionEditor
      ref="editorRef"
      v-model="modelValue"
      :size="computedSize"
      :data-disabled="disabled"
      :class="{ 'is-disabled': disabled }"
      :placeholder="placeholder"
      :disabled="disabled"
      :triggers="triggers"
      :submit-on-enter="submitOnEnter"
      :rows="rows"
      :auto-grow="autoGrow"
      :max-rows="maxRows"
      :editor-class="editorClass"
      :editor-attrs="editorAttrs"
      @trigger="openSuggest"
      @mention-click="onMentionClick"
      @submit="onEditorSubmit"
    />

    <template #content>
      <label
        :for="searchInputId"
        class="px-3 py-2 gap-2 flex items-center border-b bg-background-100"
      >
        <input
          :id="searchInputId"
          ref="searchInputRef"
          :value="filterKeyword"
          type="text"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          role="combobox"
          inputmode="search"
          aria-autocomplete="list"
          :aria-controls="listId"
          :aria-expanded="popoverVisible"
          :aria-busy="isPending"
          :aria-disabled="disabled"
          :placeholder="searchPlaceholder"
          class="pxd-mention--search h-7 min-w-0 text-sm flex-1 appearance-none border-none bg-transparent font-inherit text-foreground outline-none"
          @input="onSearchInput"
          @keydown="onSearchKeydownWithEscape"
        />

        <button
          type="button"
          class="px-1.5 h-5 text-xs shrink-0 cursor-pointer appearance-none rounded-sm border bg-background-100 self-focus-ring hover:bg-background-hover active:bg-background-active motion-safe:transition-colors"
          @click="closeSuggest"
        >
          <kbd class="font-sans appearance-none">Esc</kbd>
        </button>
      </label>

      <PList
        v-show="shouldRenderList"
        :id="listId"
        ref="listRef"
        :loop="false"
        :virtual="virtual"
        :loading="isPending"
        :options="listOptions"
        :default-active-index="0"
        class="max-h-68 min-h-0 w-(--popover-trigger-width) flex-1"
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

      <div v-if="$slots.footer" class="pxd-mention--footer p-2 border-t">
        <slot name="footer" />
      </div>
    </template>
  </PPopover>
</template>
