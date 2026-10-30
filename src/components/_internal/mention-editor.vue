<script lang="ts" setup>
import type { ComponentClass, ComponentSize } from '../../types/shared/props'
import type { MentionClickPayload } from '../mention/types'
import { computed, onMounted, shallowRef } from 'vue'
import { useMentionEditor } from '../../composables/_internal/use-mention-editor.js'
import { BASIC_MIN_HEIGHTS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { DEFAULT_TRIGGER } from '../../utils/_internal/mention-html.js'

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
  change: [string]
  submit: [string]
  'update:model-value': [string]
  'mention-click': [MentionClickPayload]
}>()

// `lh` follows the element's own line-height so the geometry survives font overrides;
// browsers without the unit ignore it and fall back to the min-height classes.
const SIZES = {
  sm: { height: `${BASIC_MIN_HEIGHTS.sm} py-[0.3125rem]`, pad: '0.3125rem' },
  md: { height: `${BASIC_MIN_HEIGHTS.md} py-[0.46875rem]`, pad: '0.46875rem' },
  lg: { height: `${BASIC_MIN_HEIGHTS.lg} py-2.75`, pad: '0.6875rem' },
} as const

const editorRef = shallowRef<HTMLElement>()

const configProvider = useConfigProvider()

const computedSize = computed(() => props.size || configProvider.size)

const editorSizeStyle = computed(() => {
  const style: Record<string, string> = {}
  const vertical = `calc(${SIZES[computedSize.value].pad} * 2)`

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
    emits('change', html)
  },
  onTrigger: (trigger) => emits('trigger', trigger),
  onSubmit: (html) => emits('submit', html),
  onMentionClick: (payload) => emits('mention-click', payload),
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
    v-bind="$attrs"
  >
    <span
      v-if="isEmpty && !isComposing && placeholder"
      class="pxd-mention-editor--placeholder text-sm inset-0 px-3 py-2 pointer-events-none absolute text-gray-600 select-none"
      aria-hidden="true"
    >
      {{ placeholder }}
    </span>

    <div
      ref="editorRef"
      class="pxd-mention-editor pxd-input--border px-3 text-sm relative w-full max-w-full appearance-none rounded-inherit bg-transparent font-inherit break-all text-foreground outline-none motion-safe:transition-appearance"
      :class="[SIZES[computedSize].height, editorClass]"
      :style="editorSizeStyle"
      role="textbox"
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
  display: inline;
  margin-inline-end: 0.25rem;
  color: var(--color-blue-900);
  cursor: pointer;

  &:hover {
    background: var(--color-blue-200);
  }
}
</style>
