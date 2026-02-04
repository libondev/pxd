<script lang="ts" setup>
import type { ChoiceboxProps } from '../../types/components/choicebox'
import { computed, markRaw } from 'vue'
import { useChoiceboxGroupContext, useChoiceboxGroupModelValue } from '../../contexts/choicebox'
import PCheckbox from '../checkbox/index.vue'
import PRadio from '../radio/index.vue'

defineOptions({
  name: 'PChoicebox',
})

const props = defineProps<ChoiceboxProps>()

const choiceboxModelValue = useChoiceboxGroupModelValue()
const choiceboxGroupContext = useChoiceboxGroupContext()

const renderComponent = computed(() => markRaw(choiceboxGroupContext.multiple ? PCheckbox : PRadio))

const computedAttrs = computed(() => {
  const { disabled, required, value } = props

  return {
    value,
    disabled,
    required,
    class:
      'pxd-choicebox justify-between border rounded-md flex-1 w-full p-3 flex-row-reverse hover:bg-background-hover hover:border-gray-500 motion-safe:transition-colors',
  }
})
</script>

<template>
  <Component :is="renderComponent" v-model="choiceboxModelValue" v-bind="computedAttrs">
    <div class="gap-1 flex flex-col">
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
  </Component>
</template>

<style lang="postcss">
.pxd-choicebox[aria-checked='true'] {
  border-color: var(--color-primary);
  background-color: hsla(var(--primary), 0.08);

  .pxd-choicebox--label,
  .pxd-choicebox--description {
    color: var(--color-primary);
  }
}

.pxd-choicebox.is-disabled {
  background-color: var(--color-background-100);
  border-color: var(--color-border);

  .pxd-choicebox--label,
  .pxd-choicebox--description {
    color: var(--color-gray-500);
  }
}
</style>
