<script lang="ts" setup>
import type { ButtonProps } from '../../types/components'
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'
import { useConfigProviderSize } from '../../composables/useConfigProviderContext'
import { getFallbackValue } from '../../utils/value'
import PSpinner from '../spinner/index.vue'

defineOptions({
  name: 'PButton',
})

const props = withDefaults(
  defineProps<ButtonProps>(),
  {
    icon: false,
    as: 'button',
    align: 'center',
    variant: 'default',
  },
)

const emits = defineEmits<{
  click: [MouseEvent]
  dblclick: [MouseEvent]
}>()

const SIZES = {
  xs: 'h-6 px-1 rounded-md',
  sm: 'h-7.5 px-1.5 rounded-md',
  md: 'h-9 px-2.5 rounded-md',
  lg: 'h-10 px-3.5 rounded-lg',
}

const FONT_SIZES = {
  xs: 'text-sm',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
}

const VARIANTS = {
  simple: '',
  default: 'bg-background text-foreground hover:bg-background-hover active:bg-background-active border-input',
  ghost: 'bg-transparent text-foreground hover:bg-gray-alpha-200 active:bg-gray-alpha-300 border-transparent',
  primary: 'bg-primary text-gray-100 hover:bg-primary/80 active:bg-gray-900 border-transparent',
  error: 'bg-red-800 text-white  hover:bg-red-700 active:bg-red-900 border-transparent',
  warning: 'bg-amber-800 text-black hover:bg-amber-700 active:bg-amber-900 border-transparent',
  success: 'bg-green-800 text-white hover:bg-green-700 active:bg-green-900 border-transparent',
}

const ALIGNMENTS = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

const DISABLED_CLASS_NAMES = 'is-disabled bg-gray-100 hover:bg-gray-100 active:bg-gray-100 cursor-not-allowed text-gray-700 border-gray-300'

const computedSize = useConfigProviderSize(props.size, SIZES)
const computedFontSize = useConfigProviderSize(props.size, FONT_SIZES)
const computedDisabled = computed(() => props.disabled || props.loading)

const computedClass = computed(() => {
  const classNames = ['pxd-button cursor-pointer select-none items-center motion-safe:transition-all', ALIGNMENTS[props.align]]

  const { variant, block, shape, icon } = props

  classNames.push(computedFontSize.value)

  if (icon) {
    classNames.push('aspect-square !p-0')
  }

  if (variant !== 'simple') {
    classNames.push('border outline-none self-focus-ring')

    classNames.push(getFallbackValue(variant, VARIANTS))

    classNames.push(computedSize.value)
  }

  classNames.push(block ? 'flex w-full' : 'inline-flex')

  if (computedDisabled.value) {
    classNames.push(DISABLED_CLASS_NAMES)
  }

  if (shape) {
    classNames.push(
      shape === 'square'
        ? 'rounded-none'
        : 'rounded-full',
    )
  }

  return twMerge(classNames)
})

function onButtonClick(event: MouseEvent) {
  emits('click', event)
}

function onButtonDblClick(event: MouseEvent) {
  emits('dblclick', event)
}
</script>

<template>
  <component
    :is="as"
    role="button"
    :class="computedClass"
    :disabled="computedDisabled"
    @click="onButtonClick"
    @dblclick.prevent="onButtonDblClick"
  >
    <PSpinner v-if="loading" />

    <slot name="prefix" />

    <span class="px-1.5 inline-flex truncate">
      <slot />
    </span>

    <slot name="suffix" />
  </component>
</template>
