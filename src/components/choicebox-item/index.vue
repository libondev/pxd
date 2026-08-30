<script lang="ts" setup>
import type { ChoiceboxItemProps } from './types'
import CheckIcon from '@gdsicon/vue/check'
import { computed } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useChoiceboxContext } from '../../contexts/choicebox.js'
import { toArray } from '../../utils/format.js'
import { getUniqueId } from '../../utils/helper.js'

defineOptions({
  name: 'PChoiceboxItem',
  inheritAttrs: false,
})

const props = defineProps<ChoiceboxItemProps>()

const choiceboxGroupContext = useChoiceboxContext()

const inputId = getUniqueId()
const internalId = getUniqueId()
const modelValue = useModelValue(choiceboxGroupContext?.props, choiceboxGroupContext?.emits)

const isMultiple = computed(() => {
  return !!choiceboxGroupContext?.props.multiple
})

const isDisabled = computed(() => {
  return props.disabled || !!choiceboxGroupContext?.props.disabled || false
})

const isSelected = computed(() => {
  if (isMultiple.value) {
    return toArray(modelValue.value).includes(props.value)
  }

  return modelValue.value === props.value
})

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-choicebox-item w-full flex-1 shrink-0 rounded-md border motion-safe:transition-colors',
    variants: {
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: 'cursor-pointer',
      },
      selected: {
        true: 'border-primary',
      },
    },
    compoundVariants: [
      {
        disabled: false,
        selected: false,
        class: 'hover:border-gray-500 hover:bg-background-hover',
      },
    ],
  },
  {
    selection: () => ({
      disabled: isDisabled.value,
      selected: isSelected.value,
    }),
  },
)

const { classes: innerClasses } = useTailwindVariant(
  {
    base: 'pxd-choicebox-item--inner size-4 p-0.5 pointer-events-none order-2 inline-flex shrink-0 transform-gpu items-center justify-center overflow-hidden border text-primary-foreground peer-focus-ring motion-safe:transition-colors',
    variants: {
      disabled: {},
      multiple: {
        true: 'rounded-sm',
        false:
          'after:content-empty after:size-2 rounded-full after:scale-40 after:rounded-full after:bg-primary after:opacity-0',
      },
      selected: {
        true: 'border-primary',
        false: 'border-gray-alpha-400',
      },
    },
    compoundVariants: [
      {
        multiple: false,
        selected: false,
        class: '',
      },
      {
        disabled: true,
        multiple: true,
        class: 'bg-gray-100',
      },
      {
        multiple: true,
        selected: true,
        class: 'bg-primary',
      },
      {
        multiple: false,
        selected: true,
        class: 'after:scale-100 after:opacity-100 motion-safe:after:transition-appearance',
      },
    ],
  },
  {
    mergeAttrsClass: false,
    selection: () => ({
      disabled: isDisabled.value,
      multiple: isMultiple.value,
      selected: isSelected.value,
    }),
  },
)

const inputName = computed(() => {
  if (isMultiple.value) {
    return internalId
  }

  return choiceboxGroupContext?.name || internalId
})

function onInputChange(event: Event) {
  if (isDisabled.value) {
    return
  }

  const inputValue = props.value
  const checked = (event.target as HTMLInputElement).checked

  if (isMultiple.value) {
    if (Array.isArray(modelValue.value)) {
      modelValue.value = checked
        ? [...modelValue.value, inputValue]
        : modelValue.value.filter((v) => v !== inputValue)

      return
    }

    modelValue.value = [inputValue]

    return
  }

  modelValue.value = inputValue
}
</script>

<template>
  <label
    :role="isMultiple ? 'checkbox' : 'radio'"
    :data-disabled="isDisabled"
    :aria-selected="isSelected"
    :for="inputId"
    :class="classes"
    v-bind="attrs"
  >
    <div
      class="pxd-choicebox-item--option p-3 flex items-center justify-between motion-safe:transition-colors"
    >
      <input
        :id="inputId"
        :type="isMultiple ? 'checkbox' : 'radio'"
        :value="value"
        class="peer visually-hidden"
        :checked="isSelected"
        :disabled="isDisabled"
        :name="inputName"
        @change="onInputChange"
      />

      <span aria-hidden="true" :class="innerClasses">
        <CheckIcon v-if="isMultiple && isSelected" />
      </span>

      <div class="gap-1 flex flex-col">
        <span class="pxd-choicebox-item--label text-sm font-medium">
          <slot name="label">
            {{ label }}
          </slot>
        </span>
        <span class="pxd-choicebox-item--description text-sm text-gray-900 empty:hidden">
          <slot name="description">
            {{ description }}
          </slot>
        </span>
      </div>
    </div>

    <div
      v-if="$slots.default"
      v-show="isSelected"
      class="pxd-choicebox-item--content border-t border-primary motion-safe:transition-colors"
    >
      <slot />
    </div>
  </label>
</template>

<style lang="postcss">
.pxd-choicebox-item[aria-selected='true'] {
  .pxd-choicebox-item--option {
    background-color: hsla(var(--primary), 0.08);
  }

  .pxd-choicebox-item--label,
  .pxd-choicebox-item--description {
    color: var(--color-primary);
  }
}
</style>
