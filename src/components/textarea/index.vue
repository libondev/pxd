<script setup lang="ts">
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { useModelValue } from '../../composables/use-model-value'
import { isTruthyProp } from '../../utils/format'
import { getUniqueId } from '../../utils/uid'
import { textareaVariant } from './cn'
import type { TextareaEmits, TextareaProps } from './types'

defineOptions({
  name: 'PTextarea',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<TextareaProps>(), {
  modelValue: '',
})

const emits = defineEmits<TextareaEmits>()

const uniqueId = getUniqueId()

const modelValue = useModelValue(props, emits)

const configProvider = useConfigProvider()

const computedClasses = computed(() => {
  return textareaVariant({
    size: props.size || configProvider.size,
    error: isTruthyProp(props.error),
    disabled: isTruthyProp(props.disabled),
    readonly: isTruthyProp(props.readonly),
  })
})

function onInputFocus(event: FocusEvent) {
  emits('focus', event)
}

function onInputBlur(event: FocusEvent) {
  emits('blur', event)
}

function onInputChange(event: Event) {
  emits('change', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <label
    :for="uniqueId"
    class="pxd-textarea pxd-input--border flex size-full min-h-inherit max-w-full items-center justify-center overflow-hidden rounded-md bg-background-100 motion-safe:transition-all"
    :class="computedClasses"
  >
    <textarea
      :id="uniqueId"
      v-model="modelValue"
      class="py-2.5 px-3 size-full min-h-inherit resize-none appearance-none rounded-inherit border-none bg-transparent font-inherit outline-none placeholder:text-gray-600 placeholder:select-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 disabled:placeholder:text-gray-400"
      autocorrect="off"
      autocomplete="off"
      autocapitalize="off"
      :rows="rows"
      :cols="cols"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :autofocus="autofocus"
      :minlength="minlength"
      :maxlength="maxlength"
      :placeholder="placeholder"
      @change="onInputChange"
      @focus="onInputFocus"
      @blur="onInputBlur"
    />
  </label>
</template>
