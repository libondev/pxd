<script lang="ts" setup>
import type { SearchInputEmits, SearchInputProps } from './types'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import MagnifyingGlassIcon from '@gdsicon/vue/magnifying-glass'
import { shallowRef } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useFormControl } from '../../composables/_internal/use-form-control.js'
import { useForwardRefExpose } from '../../composables/_internal/use-forward-ref-expose.js'
import { isCompositionKeydown } from '../../utils/event.js'
import PInput from '../input/index.vue'

defineOptions({
  name: 'PSearchInput',
  inheritAttrs: false,
})

const props = defineProps<SearchInputProps>()
const emits = defineEmits<SearchInputEmits>()

const inputRef = shallowRef<InstanceType<typeof PInput>>()

const { disabled: isDisabled, readonly: isReadonly } = useFormControl({
  disabled: () => props.disabled,
  readonly: () => props.readonly,
})

useAgentNode({
  name: 'search-input',
  state: () => ({
    value: props.modelValue ?? '',
    loading: props.loading ?? false,
    disabled: isDisabled.value,
    readonly: isReadonly.value,
  }),
  actions: {
    setValue: (value) => {
      emits('update:model-value', value == null ? '' : String(value))
    },
    search: () => {
      const value = props.modelValue == null ? '' : String(props.modelValue)

      if (value && !props.loading) {
        emits('search', value)
      }
    },
    focus: () => inputRef.value?.focus(),
    blur: () => inputRef.value?.blur(),
    select: () => inputRef.value?.select(),
  },
})

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || props.loading || isCompositionKeydown(event)) {
    return
  }

  const value = (event.target as HTMLInputElement).value

  if (!value) {
    return
  }

  emits('search', value)
}

defineExpose(useForwardRefExpose(inputRef))
</script>

<template>
  <PInput
    data-search-input
    ref="inputRef"
    :default-prefix-style="false"
    v-bind="$attrs"
    :model-value="modelValue"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    @keydown="onKeydown"
    @update:model-value="emits('update:model-value', $event)"
  >
    <template #prefix>
      <div class="pxd-search-input--prefix-icon ps-3">
        <LoaderCircleIcon v-if="loading" class="motion-safe:animate-spin size-sm" />
        <slot v-else name="prefix">
          <MagnifyingGlassIcon class="size-sm" />
        </slot>
      </div>
    </template>

    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
  </PInput>
</template>
