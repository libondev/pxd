<template>
  <label
    class="px-relation px-inline-flex px-items-center px-cursor-pointer px-select-none px-vertical-middle px-checkbox"
    :aria-disabled="disabledComputed"
    :class="className"
  >
    <input
      type="checkbox"
      class="px-outside-hidden"
      :checked="checked"
      :disabled="disabledComputed"
      @change="onValueChange"
    >

    <i class="px-checkbox--target px-relative px-transition px-items-center px-justify-center">
      <svg viewBox="0 0 64 64"><path d="M50.42,16.76L22.34,39.45l-8.1-11.46c-1.12-1.58-3.3-1.96-4.88-0.84c-1.58,1.12-1.95,3.3-0.84,4.88l10.26,14.51 c0.56,0.79,1.42,1.31,2.38,1.45c0.16,0.02,0.32,0.03,0.48,0.03c0.8,0,1.57-0.27,2.2-0.78l30.99-25.03c1.5-1.21,1.74-3.42,0.52-4.92  C54.13,15.78,51.93,15.55,50.42,16.76z" /></svg>
    </i>

    <span v-if="$slots.default" class="px-checkbox--label px-font-medium">
      <slot />
    </span>
  </label>
</template>

<script lang="ts" setup name="PxCheckbox">
import { checkboxProps } from './constraints'
import { checkboxGroupSymbol, formSymbol } from '../../_internal'

const props = defineProps(checkboxProps)
const emits = defineEmits<{
  (e: 'change'): void
  (e: 'update:modelValue',): void
}>()

const form = inject(formSymbol, { disabled: false })
const checkboxGroup = inject(checkboxGroupSymbol)

// default checked status
const checked = ref(checkboxGroup?.getCheckedStatus(props.value) ?? props.modelValue)

const disabledComputed = computed<boolean>(() => {
  return props.disabled || checkboxGroup?.disabled || form?.disabled
})

const className = computed(() => [
  props.disabled && 'px-checkbox--disabled',
  props.indeterminate && 'indeterminate'
])

function onValueChange (): void {
  emits('update:modelValue')

  // If it's nested inside the checkbox group
  checkboxGroup && checkboxGroup.onValueChange(props.value)
}
</script>
