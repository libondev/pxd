<script lang="ts" setup>
import type { SwitchGroupEmits, SwitchGroupProps } from '../switch/types'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { useModelValue } from '../../composables/use-model-value'
import { provideUniqueId } from '../../composables/use-unique-id-context'
import { provideSwitchGroupContext, provideSwitchGroupModelValue } from '../../contexts/switch'
import { getFallbackValue } from '../../utils/get'
import PSwitch from '../switch/index.vue'

defineOptions({
  name: 'PSwitchGroup',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<SwitchGroupProps>(), {
  options: () => [],
  modelValue: '',
})

const emits = defineEmits<SwitchGroupEmits>()

const SIZES = {
  sm: 'h-7.5',
  md: 'h-9',
  lg: 'h-10',
}

const configProvider = useConfigProvider()
const modelValue = useModelValue(props, emits)
const computedSize = computed(() => getFallbackValue(props.size, SIZES, configProvider.size))

provideUniqueId('SwitchGroupName')
provideSwitchGroupContext(props)
provideSwitchGroupModelValue(modelValue)
</script>

<template>
  <div
    class="pxd-switch-group p-1 flex touch-manipulation rounded-md border"
    :class="[fullWidth ? 'w-full' : 'w-max', computedSize]"
  >
    <slot>
      <PSwitch
        v-for="option in options"
        :key="option.value"
        v-model="modelValue"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </slot>
  </div>
</template>
