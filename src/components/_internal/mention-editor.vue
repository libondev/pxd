<script lang="ts" setup>
import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentClass, ComponentSize } from '../../types/shared/props'
import type { MentionClickPayload, MentionRemovePayload } from '../mention/types'
import { computed, onMounted, shallowRef } from 'vue'
import { changeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { useMentionEditor } from '../../composables/_internal/use-mention-editor.js'
import { BASIC_MIN_HEIGHTS, SIZE_TEXT_CLASS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { DEFAULT_TRIGGER } from '../../utils/mention-html.js'

defineOptions({
  name: 'PMentionEditor',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    size?: ComponentSize
    triggers?: string[]
    submitOnEnter?: boolean
    rows?: number
    autoGrow?: boolean
    maxRows?: number
    editorClass?: ComponentClass
    editorAttrs?: Record<string, unknown>
  }>(),
  {
    modelValue: '',
    placeholder: '',
    disabled: false,
    triggers: () => [DEFAULT_TRIGGER],
    submitOnEnter: true,
    rows: 1,
    autoGrow: true,
    maxRows: undefined,
    editorClass: undefined,
    editorAttrs: undefined,
  },
)

const emits = defineEmits<{
  trigger: [string]
  change: [string, details: ChangeDetails]
  submit: [string]
  'update:model-value': [string]
  'mention-click': [MentionClickPayload]
  'mention-remove': [MentionRemovePayload]
}>()

const SIZES = {
  sm: {
    blockPadding: '0.3125rem',
    padding: '[--input-ip:0.5rem] [--input-bp:0.3125rem]',
    height: BASIC_MIN_HEIGHTS.sm,
  },
  md: {
    blockPadding: '0.46875rem',
    padding: '[--input-ip:0.75rem] [--input-bp:0.46875rem]',
    height: BASIC_MIN_HEIGHTS.md,
  },
  lg: {
    blockPadding: '0.6875rem',
    padding: '[--input-ip:0.75rem] [--input-bp:0.6875rem]',
    height: BASIC_MIN_HEIGHTS.lg,
  },
} as const

const editorRef = shallowRef<HTMLElement>()

const configProvider = useConfigProvider()

const computedSize = computed(() => props.size || configProvider.size)

const editorSizeStyle = computed(() => {
  const style: Record<string, string> = {}
  const vertical = `calc(${SIZES[computedSize.value].blockPadding} * 2)`

  if (props.rows > 1) {
    style.minHeight = `calc(${props.rows}lh + ${vertical})`
  }

  if (props.maxRows != null) {
    style.maxHeight = `calc(${props.maxRows}lh + ${vertical})`
    style.overflowY = 'auto'
  }

  if (!props.autoGrow) {
    style.height = `calc(${props.rows}lh + ${vertical})`
    style.overflowY = 'auto'
  }

  return style
})

const {
  isEmpty,
  isComposing,
  insertMention,
  focus,
  blur,
  clear,
  setText,
  insertText,
  replaceQuery,
  restoreCaret,
  onBeforeInput,
  onInput,
  onKeydown,
  onPaste,
  onClick,
  onCopyOrCut,
  onCompositionStart,
  onCompositionEnd,
  mount,
} = useMentionEditor({
  editorRef,
  getModelValue: () => props.modelValue ?? '',
  getTriggers: () => props.triggers,
  isDisabled: () => props.disabled,
  isSubmitOnEnter: () => props.submitOnEnter,
  onUpdate: (html) => {
    emits('update:model-value', html)
    emits('change', html, changeDetailsFor({ reason: 'typed' }))
  },
  onTrigger: (trigger) => emits('trigger', trigger),
  onSubmit: (html) => emits('submit', html),
  onMentionClick: (payload) => emits('mention-click', payload),
  onMentionRemove: (payload) => emits('mention-remove', payload),
})

onMounted(() => {
  mount()
})

defineExpose({
  insertMention,
  focus,
  blur,
  clear,
  setText,
  insertText,
  replaceQuery,
  restoreCaret,
})
</script>

<template>
  <div
    data-mention-editor
    class="pxd-mention relative w-full max-w-full rounded-md bg-background-100"
    :class="SIZES[computedSize].padding"
    v-bind="$attrs"
  >
    <span
      v-if="isEmpty && !isComposing && placeholder"
      :class="SIZE_TEXT_CLASS[computedSize]"
      class="pxd-mention-editor--placeholder inset-0 pointer-events-none absolute px-(--input-ip) py-(--input-bp) text-gray-600 select-none"
      aria-hidden="true"
    >
      {{ placeholder }}
    </span>

    <div
      ref="editorRef"
      class="pxd-mention-editor pxd-input--border relative w-full max-w-full appearance-none rounded-inherit bg-transparent px-(--input-ip) py-(--input-bp) font-inherit break-all text-foreground outline-none motion-safe:transition-appearance"
      :class="[SIZES[computedSize].height, SIZE_TEXT_CLASS[computedSize], editorClass]"
      :style="editorSizeStyle"
      role="textbox"
      spellcheck="false"
      autocorrect="off"
      autocomplete="off"
      autocapitalize="off"
      aria-multiline="true"
      :contenteditable="disabled ? 'false' : 'true'"
      :data-empty="isEmpty"
      :data-disabled="disabled"
      :aria-placeholder="placeholder"
      :aria-disabled="disabled"
      v-bind="editorAttrs"
      @beforeinput="onBeforeInput"
      @input="onInput"
      @keydown="onKeydown"
      @paste="onPaste"
      @click="onClick"
      @copy="onCopyOrCut"
      @cut="onCopyOrCut"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
    />
  </div>
</template>

<style lang="postcss">
.pxd-mention-editor[data-disabled='true'] {
  cursor: not-allowed;
  color: var(--color-gray-700);
}

.pxd-mention--chip {
  display: inline-block;
  min-width: 0;
  vertical-align: top;
  padding-inline: 0.125rem;
  color: var(--color-blue-900);
  border-radius: var(--radius-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: var(--color-blue-200);
  }
}
</style>
