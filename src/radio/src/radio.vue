<template>
  <label class="px-relation px-inline-flex px-items-center px-cursor-pointer px-select-none px-vertical-middle px-radio" :aria-disabled="disabledComputed">
    <input
      ref="radioRef"
      type="radio"
      class="px-outside-hidden"
      :disabled="disabledComputed"
      @change="onChangeValue"
    >

    <i class="px-radio--target px-relative px-transition px-items-center px-justify-center" />

    <span v-if="$slots.default" class="px-radio--label px-font-medium">
      <slot />
    </span>
  </label>
</template>

<script lang="ts" setup name="PxRadio">
import { radioProps } from './constraints'
import { formSymbol, radioGroupSymbol } from '../../_internal'

const props = defineProps(radioProps)

const radioRef = ref<HTMLInputElement>()

const form = inject(formSymbol, { disabled: false })
const radioGroup = inject(radioGroupSymbol, { disabled: false })

const disabledComputed = computed<boolean>(() => {
  return props.disabled || radioGroup.disabled || form.disabled
})

function onChangeValue (evt: Event): void {
  console.log(evt)
}
</script>
