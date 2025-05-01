<script setup lang="ts">
import type { ComponentSize } from '../../types/components'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import { useModelValue } from '../../composables/useModelValue'
import { getRandomId } from '../../utils/random'

type ValueType = boolean | number | string

interface Props {
  size?: ComponentSize
  modelValue: ValueType
  activeValue?: ValueType
  inactiveValue?: ValueType
  activeLabel?: string
  inactiveLabel?: string
  activeBgColor?: string
  inactiveBgColor?: string
}

defineOptions({
  name: 'PToggle',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    activeValue: true,
    inactiveValue: false,
    activeBgColor: 'var(--color-primary)',
    inactiveBgColor: 'var(--color-gray-alpha-200)',
  },
)

const emits = defineEmits<{
  'update:modelValue': [Props['modelValue']]
}>()

const config = useConfigProvider()

const SIZES = {
  sm: 'w-7 h-4',
  md: 'w-9 h-5',
  lg: 'w-11 h-6',
}

const randomId = getRandomId()
const modelValue = useModelValue(props, emits)
const isChecked = computed(() => modelValue.value === props.activeValue)

const computedSize = computed(() => {
  return SIZES[props.size || config.size]
})

function onCheckboxChange(e: Event) {
  const target = e.target as HTMLInputElement
  modelValue.value = target.checked ? props.activeValue : props.inactiveValue
}
</script>

<template>
  <label
    role="switch"
    class="pxd-toggle inline-flex items-center cursor-pointer select-none"
    :aria-label="modelValue ? activeLabel : inactiveLabel"
    :style="{
      '--abc': activeBgColor,
      '--ibc': inactiveBgColor,
    }"
    :for="randomId"
  >
    <input
      :id="randomId"
      type="checkbox"
      :checked="isChecked"
      class="smallest peer"
      @change="onCheckboxChange"
    >

    <span
      v-if="inactiveLabel"
      class="pxd-toggle--label motion-safe:transition-opacity opacity-100 peer-checked:opacity-50 mr-1.5 pl-0.5"
    >{{ inactiveLabel }}</span>

    <div
      class="pxd-toggle--handle border border-gray-alpha-200 p-px rounded-full motion-safe:transition-colors [--tx:0] bg-(--ibc) peer-focus-ring peer-checked:bg-(--abc) peer-checked:[--tx:100%]"
      :class="computedSize"
    >
      <span class="pxd-toggle--handle-icon flex items-center justify-center bg-background aspect-square h-full rounded-full border border-gray-alpha-200 transform-gpu translate-x-(--tx) motion-safe:transition-transform">
        <slot v-if="modelValue" name="active-icon" />
        <slot v-else name="inactive-icon" />
      </span>
    </div>

    <span
      v-if="activeLabel"
      class="pxd-toggle--label motion-safe:transition-opacity opacity-50 peer-checked:opacity-100 ml-1.5 pr-0.5"
    >{{ activeLabel }}</span>
  </label>
</template>
