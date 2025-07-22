<script setup lang="ts">
import type { ComponentSize } from '../../types/shared'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import { useModelValue } from '../../composables/useModelValue'
import { getUniqueId } from '../../utils/uid'
import { getFallbackValue } from '../../utils/value'

type ValueType = boolean | number | string

interface Props {
  size?: ComponentSize
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
    class="pxd-toggle group/toggle inline-flex items-center cursor-pointer select-none"
    :aria-label="modelValue ? activeLabel : inactiveLabel"
    :style="{
      '--abc': activeBgColor,
      '--ibc': inactiveBgColor,
    }"
    :for="uniqueId"
  >
    <input
      :id="uniqueId"
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
      class="pxd-toggle--handle border border-input p-px rounded-full motion-safe:transition-all [--tx:0] bg-(--ibc) peer-focus-ring peer-checked:bg-(--abc) peer-checked:[--tx:100%]"
      :class="computedSize"
    >
      <span class="pxd-toggle--handle-icon flex items-center justify-center bg-background aspect-square h-full rounded-full border border-input transform-gpu translate-x-(--tx) motion-safe:transition-transform group-hover/toggle:will-change-transform">
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
