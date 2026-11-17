<script lang="ts" setup>
import type { CheckboxEmits, CheckboxProps } from './types'
import CheckIcon from '@gdsicon/vue/check'
import MinusIcon from '@gdsicon/vue/minus'
import { computed, shallowRef } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useCheckboxGroupContext } from '../../contexts/checkbox.js'
import { getUniqueId } from '../../utils/helper.js'

defineOptions({
  name: 'PCheckbox',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CheckboxProps>(), {
  shape: 'default',
  value: true,
})

const emits = defineEmits<CheckboxEmits>()

const uniqueId = getUniqueId()

const rootRef = shallowRef<HTMLElement>()

const checkboxGroupContext = useCheckboxGroupContext()

const isDisabled = computed(() => props.disabled || checkboxGroupContext?.props.disabled || false)

const { modelValue, change } = useModelValue(
  checkboxGroupContext?.props ?? props,
  checkboxGroupContext?.emits ?? emits,
)

const isSelected = computed(() => {
  if (Array.isArray(modelValue.value)) {
    return modelValue.value.includes(props.value)
  }

  if (typeof props.value === 'boolean') {
    return modelValue.value as boolean
  }

  return modelValue.value === props.value
})

const { classes } = useTailwindVariant(
  {
    base: 'pxd-checkbox--inner size-4 p-0.5 inline-flex shrink-0 transform-gpu items-center justify-center overflow-hidden border text-primary-foreground peer-focus-ring motion-safe:transition-colors',
    variants: {
      checked: {},
      disabled: {},
      shape: {
        default: 'rounded-sm',
        square: 'rounded-none',
        rounded: 'rounded-full',
      },
    },
    compoundVariants: [
      {
        checked: true,
        disabled: false,
        class: 'border-primary bg-primary',
      },
      {
        checked: true,
        disabled: true,
        class: 'border-gray-500 bg-gray-500',
      },
      {
        checked: false,
        disabled: false,
        class: 'border-gray-alpha-400 bg-background-100 group-hover/checkbox:bg-gray-200',
      },
      {
        checked: false,
        disabled: true,
        class: 'border-gray-500 bg-gray-100',
      },
    ],
  },
  {
    mergeAttrsClass: false,
    selection: () => ({
      shape: props.shape,
      checked: isSelected.value,
      disabled: isDisabled.value,
    }),
  },
)

useAgentNode({
  name: 'checkbox',
  el: () => rootRef.value,
  state: () => ({
    checked: isSelected.value,
    disabled: isDisabled.value,
    indeterminate: props.indeterminate ?? false,
  }),
  actions: {
    setValue: (value) => {
      change(value, { reason: 'api' })
    },
    toggle: () => {
      change(!isSelected.value, { reason: 'api' })
    },
  },
})

function onInputChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked

  if (Array.isArray(modelValue.value)) {
    change(
      checked
        ? [...modelValue.value, props.value]
        : modelValue.value.filter((v) => v !== props.value),
      { reason: 'trigger-press', event },
    )

    return
  }

  change(checked, { reason: 'trigger-press', event })
}
</script>

<template>
  <label
    ref="rootRef"
    data-checkbox
    :data-disabled="isDisabled"
    class="pxd-checkbox group/checkbox gap-2 relative inline-flex max-w-full cursor-pointer touch-manipulation items-center data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-gray-500"
    :for="uniqueId"
    v-bind="$attrs"
  >
    <input
      :id="uniqueId"
      :value="value"
      type="checkbox"
      class="peer visually-hidden"
      :checked="isSelected"
      :indeterminate="indeterminate"
      :disabled="isDisabled"
      :name="uniqueId"
      @change="onInputChange"
    />

    <span aria-hidden="true" :class="classes">
      <CheckIcon v-if="isSelected" class="size-3" />
      <MinusIcon v-else-if="indeterminate" class="size-3" />
      <span v-else class="size-3" />
    </span>

    <span class="text-sm flex-1 shrink-0 leading-none empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
