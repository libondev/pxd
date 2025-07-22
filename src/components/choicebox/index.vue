<script lang="ts" setup>
import type { ComponentLabel, ComponentValue } from '../../types/shared'
import { computed, inject, markRaw } from 'vue'
import PCheckbox from '../checkbox/index.vue'
import PRadio from '../radio/index.vue'

interface Props {
  label?: ComponentLabel
  value?: ComponentValue
  disabled?: boolean
  required?: boolean
  description?: string
}

defineOptions({
  name: 'PChoicebox',
})

const props = defineProps<Props>()

const modelValue = inject('pxdChoiceboxGroupModelValue') as ComponentValue | ComponentValue[]
const choiceboxGroupProps = inject('pxdChoiceboxGroupProps', { multiple: false })

const renderComponent = computed(() => markRaw(choiceboxGroupProps.multiple ? PCheckbox : PRadio))

const computedAttrs = computed(() => {
  const { disabled, required, value } = props

  return {
    value,
    disabled,
    required,
    class: 'pxd-choicebox justify-between border rounded-md flex-1 p-3 flex-row-reverse hover:bg-background-hover hover:border-gray-500 motion-safe:transition-colors',
  }
})
</script>

<template>
  <component :is="renderComponent" v-model="modelValue" v-bind="computedAttrs">
    <div class="flex flex-col gap-1">
      <span class="pxd-choicebox--label font-medium">
        <slot name="label">
          {{ label }}
        </slot>
      </span>
      <span class="pxd-choicebox--description text-sm text-foreground-secondary">
        <slot name="description">
          {{ description }}
        </slot>
      </span>
    </div>
  </component>
</template>

<style lang="postcss">
.pxd-choicebox[aria-checked="true"] {
  border-color: var(--color-primary);
  background-color: hsla(var(--primary), 0.08);

  .pxd-choicebox--label,
  .pxd-choicebox--description {
    color: var(--color-primary);
  }
}

.pxd-choicebox.is-disabled {
  background-color: var(--color-background);
  border-color: var(--color-border);

  .pxd-choicebox--label,
  .pxd-choicebox--description {
    color: var(--color-gray-500);
  }
}
</style>
