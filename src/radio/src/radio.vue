<template>
  <label
    :class="className"
    :aria-disabled="disabledComputed"
  >
    <input
      ref="radioRef"
      type="radio"
      class="carbons-outside"
      :disabled="disabledComputed"
      @change="onChangeValue"
    >
    <i class="c-radio--target carbons-relative carbons-transition carbons-items-center carbons-justify-center" />
    <span
      v-if="$slots.default"
      class="c-radio--label"
    >
      <slot />
    </span>
  </label>
</template>

<script lang="ts" setup name="CRadio">
import { radioProps } from './constraints'
import { formSymbol, radioGroupSymbol } from '../../_internal'
import { getFilledClassNames } from '../../_utils'

const props = defineProps(radioProps)

const radioRef = ref<HTMLInputElement>()
const className = computed(() => {
  return ['c-radio', getFilledClassNames('relation inline-flex items-center cursor-pointer select-none')]
})

const form = inject(formSymbol, { disabled: false })
const radioGroup = inject(radioGroupSymbol, { disabled: false })

const disabledComputed = computed<boolean>(() => {
  return props.disabled || radioGroup.disabled || form.disabled
})

function onChangeValue (evt: Event): void {
  console.log(evt)
}
</script>
