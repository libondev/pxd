<template>
  <div class="px-input px-inline-flex px-width-full px-vertical-top">
    <div v-if="$slots.prepend" :class="`px-input--prepend px-padding-${size} px-font-${size}`">
      <slot name="prepend" />
    </div>

    <input
      v-model="modelValue"
      type="text"
      :class="className"
      :disabled="disabled"
      :readonly="readonly"
      :placeholder="placeholder"
    >

    <div v-if="$slots.append" :class="`px-input--append px-padding-${size} px-font-${size}`">
      <slot name="append" />
    </div>
  </div>
</template>

<script lang="ts" setup name="PxInput">
import { inputProps } from './constraints'
import { useDisabled, useSize } from '../../_hooks'

const props = defineProps(inputProps)
const emits = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const size = useSize(props)
const className = computed(() => [
  'px-input--inner px-floating-tip px-relative px-transition px-width-full',
  `px-padding-${size.value} px-font-${size.value}`,
  props.ellipsis && 'px-overflow-ellipsis'
])

const disabled = useDisabled(props)
const placeholder = computed(() => disabled.value || props.readonly ? '' : props.placeholder)

const modelValue = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    emits('update:modelValue', value)
  }
})
</script>
