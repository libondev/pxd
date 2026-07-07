<script lang="ts" setup>
import type { ColorSelectorEmits, ColorSelectorProps } from './types'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { useConfigProvider } from '../../contexts/config-provider'
import { getUniqueId } from '../../utils/helper'

defineOptions({
  name: 'PColorSelector',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<ColorSelectorProps>(), {
  colors: () => ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'],
})
const emits = defineEmits<ColorSelectorEmits>()

const uniqueName = getUniqueId('color-selector')

const { classes: colorSelectorClasses } = useTailwindVariant(
  {
    base: 'pxd-color-selector--item size-5 cursor-pointer appearance-none rounded-full border-2 border-transparent bg-current self-focus-ring checked:border-current checked:shadow-[inset_0_0_0_2px_var(--color-background-100)] active:scale-85 motion-safe:transition-appearance',
    variants: {
      size: {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-6',
      },
    },
  },
  { mergeAttrsClass: false },
)

const configProvider = useConfigProvider()
const modelValue = useModelValue(props, emits)

const computedClasses = computed(() =>
  colorSelectorClasses({
    size: props.size || configProvider.size,
  }),
)
</script>

<template>
  <div role="tabpanel" class="pxd-color-selector gap-2 flex" v-bind="$attrs">
    <template v-for="color in colors" :key="color">
      <input
        type="radio"
        :name="uniqueName"
        :value="color"
        :style="{ color }"
        :class="computedClasses"
        :aria-selected="modelValue === color"
        :checked="modelValue === color"
        :tabindex="modelValue === color ? 0 : -1"
        @change="modelValue = color"
      />
    </template>
  </div>
</template>
