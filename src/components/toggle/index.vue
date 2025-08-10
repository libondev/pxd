<script setup lang="ts">
import type { ComponentLabel, ComponentSize } from '../../types/shared'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { useModelValue } from '../../composables/use-model-value'
import { getUniqueId } from '../../utils/uid'
import { getFallbackValue } from '../../utils/value'

type ValueType = boolean | number | string

interface Props {
  size?: ComponentSize
  label?: ComponentLabel
  modelValue?: ValueType
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
  'update:modelValue': [NonNullable<Props['modelValue']>]
}>()

const SIZES = {
  sm: 'w-7 h-4',
  md: 'w-9 h-5',
  lg: 'w-11 h-6',
}

const uniqueId = getUniqueId()

const config = useConfigProvider()
const modelValue = useModelValue(props, emits)

const isChecked = computed(() => modelValue.value === props.activeValue)
const computedSize = computed(() => getFallbackValue(props.size, SIZES, config.size))

function onCheckboxChange(e: Event) {
  const target = e.target as HTMLInputElement
  modelValue.value = target.checked ? props.activeValue : props.inactiveValue
}
</script>

<template>
  <label
    role="switch"
    class="pxd-toggle group/toggle inline-flex cursor-pointer touch-manipulation flex-col select-none"
    :aria-label="modelValue ? activeLabel : inactiveLabel"
    :style="{
      '--abc': activeBgColor,
      '--ibc': inactiveBgColor,
    }"
    :for="uniqueId"
  >
    <div v-if="label || $slots.label" class="pxd-form--label">
      <slot name="label">{{ label }}</slot>
    </div>

    <div class="flex items-center">
      <input
        :id="uniqueId"
        type="checkbox"
        :checked="isChecked"
        class="peer smallest"
        @change="onCheckboxChange"
      >

      <span
        v-if="inactiveLabel"
        class="pxd-toggle--label text-sm mr-1.5 pl-0.5 opacity-100 peer-checked:opacity-50 motion-safe:transition-opacity"
      >{{ inactiveLabel }}</span>

      <div
        class="pxd-toggle--handle rounded-full border border-input bg-(--ibc) p-px peer-focus-ring [--tx:0] peer-checked:bg-(--abc) peer-checked:[--tx:100%] motion-safe:transition-all"
        :class="computedSize"
      >
        <span class="pxd-toggle--handle-icon flex aspect-square h-full translate-x-(--tx) transform-gpu items-center justify-center rounded-full border border-input bg-background-100 group-hover/toggle:will-change-transform motion-safe:transition-transform">
          <slot v-if="modelValue" name="active-icon" />
          <slot v-else name="inactive-icon" />
        </span>
      </div>

      <span
        v-if="activeLabel"
        class="pxd-toggle--label text-sm ml-1.5 pr-0.5 opacity-50 peer-checked:opacity-100 motion-safe:transition-opacity"
      >{{ activeLabel }}</span>
    </div>
  </label>
</template>
