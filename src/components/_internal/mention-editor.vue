<script lang="ts" setup>
import type { ComponentSize } from '../../types/shared/props'
import { computed, onMounted, shallowRef } from 'vue'
import { useMentionEditor } from '../../composables/_internal/use-mention-editor.js'
import { BASIC_MIN_HEIGHTS } from '../../constants/size.js'

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
  }>(),
  {
    size: 'md',
    modelValue: '',
    placeholder: '',
    disabled: false,
  },
)

const emits = defineEmits<{
  trigger: []
  change: [string]
  'update:modelValue': [string]
  'mention-click': [{ key: string; label: string; event: MouseEvent }]
}>()

const editorRef = shallowRef<HTMLElement>()

const inputHeightClasses = computed(() => {
  return {
    sm: `${BASIC_MIN_HEIGHTS.sm} py-1`,
    md: `${BASIC_MIN_HEIGHTS.md} py-[.46875rem]`,
    lg: `${BASIC_MIN_HEIGHTS.lg} py-2.75`,
  }
})

const {
  isEmpty,
  isComposing,
  getHTML,
  insertMention,
  restoreCaret,
  clearTriggerRange,
  onBeforeInput,
  onInput,
  onKeydown,
  onPaste,
  onClick,
  onCompositionStart,
  onCompositionEnd,
  mount,
} = useMentionEditor({
  editorRef,
  getModelValue: () => props.modelValue ?? '',
  isDisabled: () => props.disabled,
  onUpdate: (html) => {
    emits('update:modelValue', html)
    emits('change', html)
  },
  onTrigger: () => emits('trigger'),
  onMentionClick: (payload) => emits('mention-click', payload),
})

onMounted(() => {
  mount()
})

defineExpose({
  focus: () => editorRef.value?.focus(),
  getHTML,
  insertMention,
  restoreCaret,
  clearTriggerRange,
  blur: () => editorRef.value?.blur(),
})
</script>

<template>
  <div
    class="pxd-mention-editor--wrap relative w-full max-w-full bg-background-100"
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
      class="pxd-mention-editor pxd-input--border px-3 text-sm relative w-full max-w-full appearance-none rounded-inherit bg-transparent font-inherit break-all text-foreground outline-none"
      :class="inputHeightClasses[size]"
      role="textbox"
      aria-multiline="true"
      :contenteditable="disabled ? 'false' : 'true'"
      :data-empty="isEmpty"
      :data-disabled="disabled"
      :aria-placeholder="placeholder || undefined"
      :aria-disabled="disabled || undefined"
      @beforeinput="onBeforeInput"
      @input="onInput"
      @keydown="onKeydown"
      @paste="onPaste"
      @click="onClick"
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

.pxd-mention--at {
  display: inline;
  padding-inline: 0.125rem;
  border-radius: 0.25rem;
  color: var(--color-blue-900);
  cursor: pointer;

  &:hover {
    background: var(--color-blue-200);
  }
}
</style>
