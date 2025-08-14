<script setup lang="ts">
import type { ComponentBeforeChange, ComponentLabel, ComponentSize } from '../../types/shared'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { useModelValue } from '../../composables/use-model-value'
import { getUniqueId } from '../../utils/uid'
import { getFallbackValue } from '../../utils/value'

type ValueType = boolean | number | string

interface Props {
  size?: ComponentSize
  label?: ComponentLabel
  loading?: boolean
  disabled?: boolean
  modelValue?: ValueType
  activeValue?: ValueType
  inactiveValue?: ValueType
  beforeChange?: ComponentBeforeChange<ValueType>
  activeColor?: string
  inactiveColor?: string
  activeLabel?: string
  inactiveLabel?: string
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
    activeColor: 'var(--color-primary)',
    inactiveColor: 'var(--color-gray-alpha-100)',
  },
)

const emits = defineEmits<{
  'change': [NonNullable<Props['modelValue']>]
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

async function onCheckboxChange(e: Event) {
  if (props.loading) {
    return
  }

  const input = e.target as HTMLInputElement
  const rawValue = input.checked

  if (typeof props.beforeChange === 'function') {
    input.checked = !rawValue
    const isAllowed = await props.beforeChange(modelValue.value)

    if (!isAllowed) {
      return
    }
  }

  const changedValue = rawValue ? props.activeValue : props.inactiveValue
  modelValue.value = changedValue
  emits('change', changedValue)
}
</script>

<template>
  <label
    role="switch"
    class="pxd-toggle group/toggle inline-flex cursor-pointer touch-manipulation flex-col select-none"
    :aria-label="modelValue ? activeLabel : inactiveLabel"
    :style="{
      '--ac': activeColor,
      '--ic': inactiveColor,
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
        :disabled="disabled || loading"
        :checked="isChecked"
        class="pxd-toggle--input peer smallest"
        @change.prevent="onCheckboxChange"
      >

      <span
        v-if="inactiveLabel"
        class="pxd-toggle--label text-sm mr-1.5 pl-0.5 opacity-100 peer-checked:opacity-50 motion-safe:transition-opacity"
      >{{ inactiveLabel }}</span>

      <div
        class="pxd-toggle--handle rounded-full border border-input bg-(--ic) p-px peer-focus-ring [--tx:0] peer-checked:bg-(--ac) peer-checked:[--tx:100%] peer-disabled:cursor-not-allowed motion-safe:transition-all"
        :class="computedSize"
      >
        <div class="pxd-toggle--handle-icon text-xs relative flex aspect-square h-full translate-x-(--tx) transform-gpu items-center justify-center overflow-hidden rounded-full border border-input bg-background-100 text-foreground-secondary motion-safe:transition-transform">
          <div class="inset-0 absolute flex items-center justify-center">
            <Transition name="pxd-transition--fade" mode="out-in">
              <LoaderCircleIcon v-if="loading" class="motion-safe:animate-spin" />
              <slot v-else-if="modelValue" name="checked" />
              <slot v-else name="unchecked" />
            </Transition>
          </div>
        </div>
      </div>

      <span
        v-if="activeLabel"
        class="pxd-toggle--label text-sm ml-1.5 pr-0.5 opacity-50 peer-checked:opacity-100 motion-safe:transition-opacity"
      >{{ activeLabel }}</span>
    </div>
  </label>
</template>

<style lang="postcss">
.pxd-toggle--input:checked:disabled + .pxd-toggle--handle {
  background-color: var(--color-gray-300)
}
</style>
