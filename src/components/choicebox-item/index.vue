<script lang="ts" setup>
import { computed, markRaw } from 'vue'
import { useChoiceboxContext } from '../../contexts/choicebox'
import PCheckbox from '../checkbox/index.vue'
import PRadio from '../radio/index.vue'
import type { ChoiceboxProps } from './types'

defineOptions({
  name: 'PChoiceboxItem',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

defineProps<ChoiceboxProps>()

const choiceboxGroupContext = useChoiceboxContext()

const renderAs = computed(() => markRaw(choiceboxGroupContext?.props.multiple ? PCheckbox : PRadio))
</script>

<template>
  <Component
    :is="renderAs"
    :value="value"
    :disabled="disabled"
    class="pxd-choicebox-item p-3 w-full flex-1 flex-row-reverse justify-between rounded-md border hover:border-gray-500 hover:bg-background-hover motion-safe:transition-colors"
    v-bind="$attrs"
  >
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
.pxd-choicebox[aria-selected='true'] {
  border-color: var(--color-primary);
  background-color: hsla(var(--primary), 0.08);

  .pxd-choicebox--label,
  .pxd-choicebox--description {
    color: var(--color-primary);
  }
}

.pxd-choicebox[data-disabled='true'] {
  background-color: var(--color-background-100);
  border-color: var(--color-border);

  .pxd-choicebox--label,
  .pxd-choicebox--description {
    color: var(--color-gray-500);
  }
}
</style>
