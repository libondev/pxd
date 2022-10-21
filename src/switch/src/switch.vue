<template>
  <button
    :class="['c-switch carbons-transition carbons-inline-block carbons-cursor-pointer carbons-relative', { 'c-switch--loading': loading }]"
    :disabled="disabled"
    :style="computedStyle"
    aria-label="toggle button"
    :aria-checked="modelValue === props.activeValue"
    @click="onSwitchClick"
  >
    <i class="c-switch--node carbons-flex carbons-items-center carbons-justify-center carbons-transition carbons-relative">
      <loading-spinner
        v-if="loading"
        size=".68em"
        color="var(--primary-6)"
      />
    </i>
  </button>
</template>

<script lang="ts" setup name="CSwitch">
import { switchProps } from './constraints'
import { appendCSSUnit } from '../../_utils'
import { useToggle } from '../../_hooks'

const LoadingSpinner = defineAsyncComponent(() => import('../../spinner'))

const props = defineProps(switchProps)
const emits = defineEmits <{
  (event: 'change', evt: typeof props.activeValue): void
  (event: 'update:modelValue', value: typeof props.activeValue): void
}>()

const computedStyle = computed(() => ({
  '--size': appendCSSUnit(props.size),
  '--active-color': props.activeColor,
  '--inactive-color': props.inactiveColor
}))

const modelValue = computed({
  get () {
    return props.modelValue
  },
  set (value: typeof props.activeValue) {
    emits('update:modelValue', value)
  }
})

const toggle = useToggle(modelValue, {
  truthyValue: props.activeValue,
  falsyValue: props.inactiveValue
})

function onSwitchClick (): void {
  toggle()

  emits('change', modelValue.value)
}
</script>
