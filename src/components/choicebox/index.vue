<script lang="ts" setup>
import type { ChoiceboxEmits, ChoiceboxProps } from './types'
import { provideChoiceboxContext } from '../../contexts/choicebox'
import { getUniqueId } from '../../utils/helper'
import PChoiceboxItem from '../choicebox-item/index.vue'
import PStack from '../stack/index.vue'

defineOptions({
  name: 'PChoicebox',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<ChoiceboxProps>(), { gap: 3 })
const emits = defineEmits<ChoiceboxEmits>()

provideChoiceboxContext({ props, emits, name: getUniqueId() })
</script>

<template>
  <PStack
    aria-label="Choicebox Group"
    :gap="gap"
    :aria-multiselectable="multiple"
    :role="multiple ? 'group' : 'radiogroup'"
    class="pxd-choicebox"
    v-bind="$attrs"
  >
    <slot>
      <PChoiceboxItem v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </PStack>
</template>
