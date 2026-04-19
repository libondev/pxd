<script setup lang="ts">
import type { ToggleEmits, ToggleProps } from './types'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useConfigProvider } from '../../contexts/config-provider'
import { getFallbackValue } from '../../utils/get'
import { getUniqueId } from '../../utils/uid'

defineOptions({
  name: 'PToggle',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<ToggleProps>(), {
  activeValue: true,
  inactiveValue: false,
  activeColor: 'var(--color-primary)',
  inactiveColor: 'var(--color-gray-alpha-100)',
})

const emits = defineEmits<ToggleEmits>()

const SIZES = {
  sm: 'w-7 h-4',
  md: 'w-9 h-5',
  lg: 'w-11 h-6',
}

const uniqueId = getUniqueId()

const configProvider = useConfigProvider()
const modelValue = useModelValue(props, emits)

const isChecked = computed(() => modelValue.value === props.activeValue)
const isDisabled = computed(() => props.disabled || props.loading)
const computedSize = computed(() => getFallbackValue(props.size, SIZES, configProvider.size))

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
    :for="uniqueId"
    class="pxd-toggle group/toggle inline-flex cursor-pointer touch-manipulation items-center select-none"
    :aria-label="modelValue ? activeLabel : inactiveLabel"
    v-bind="$attrs"
  >
    <input
      :id="uniqueId"
      type="checkbox"
      :disabled="isDisabled"
      :checked="isChecked"
      class="pxd-toggle--input peer visually-hidden"
      @change.prevent="onCheckboxChange"
    />

    <span
      v-if="inactiveLabel"
      class="pxd-toggle--label text-sm mr-1.5 pl-0.5 leading-none opacity-100 peer-checked:opacity-50 motion-safe:transition-opacity"
      >{{ inactiveLabel }}</span
    >

    <div
      class="pxd-toggle--handle rounded-full border bg-(--toggle-inactive-color) p-px peer-focus-ring [--tx:0] peer-checked:bg-(--toggle-active-color) peer-checked:[--tx:100%] peer-disabled:cursor-not-allowed peer-checked:peer-disabled:bg-gray-500 motion-safe:transition-all"
      :class="computedSize"
      :style="{
        '--toggle-active-color': activeColor,
        '--toggle-inactive-color': inactiveColor,
      }"
    >
      <div
        :data-checked="isChecked"
        :data-disabled="isDisabled"
        class="pxd-toggle--handle-icon text-xs shadow-sm bg-white relative flex aspect-square h-full translate-x-(--tx) transform-gpu items-center justify-center overflow-hidden rounded-full text-foreground-secondary motion-safe:transition-all dark:data-[checked=true]:bg-background-100 dark:data-[disabled=true]:bg-gray-900 dark:data-[disabled=true]:text-gray-500"
      >
        <div class="inset-0 pointer-events-none absolute flex items-center justify-center">
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
      class="pxd-toggle--label text-sm ml-1.5 pr-0.5 leading-none opacity-50 peer-checked:opacity-100 motion-safe:transition-opacity"
      >{{ activeLabel }}</span
    >
  </label>
</template>
