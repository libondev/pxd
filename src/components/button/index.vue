<script lang="ts" setup>
import type { ButtonProps } from '../../types/components'
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import Spinner from '../spinner/index.vue'

defineOptions({
  name: 'PButton',
})

const props = withDefaults(
  defineProps<ButtonProps>(),
  {
    as: 'button',
    variant: 'default',
  },
)

const emits = defineEmits<{
  click: [MouseEvent]
}>()

const config = useConfigProvider()

const SIZES = {
  xs: 'px-1 rounded-md h-6',
  sm: 'px-1.5 rounded-md h-7.5',
  md: 'px-2.5 rounded-md h-9',
  lg: 'px-3.5 rounded-lg h-10.5',
}

const FONT_SIZE = {
  xs: 'text-sm',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
}

const VARIANTS = {
  simple: '',
  default: 'bg-background text-foreground hover:bg-background-hover active:bg-background-active border-input',
  ghost: 'bg-transparent text-foreground hover:bg-gray-alpha-200 active:bg-gray-alpha-300 border-transparent',
  primary: 'bg-primary text-gray-100 hover:bg-primary/80 active:bg-primary border-transparent',
  error: 'bg-red-800 text-white  hover:bg-red-700 active:bg-red-800 border-transparent',
  warning: 'bg-amber-800 text-black hover:bg-amber-700 active:bg-amber-800 border-transparent',
  success: 'bg-green-800 text-white hover:bg-green-700 active:bg-green-800 border-transparent',
}

const DISABLED_CLASS_NAMES = 'is-disabled bg-gray-100 hover:bg-gray-100 active:bg-gray-100 cursor-not-allowed text-gray-700 border-gray-300'

const computedDisabled = computed(() => {
  return props.disabled || props.loading
})

const computedClasses = computed(() => {
  const classNames = ['pxd-button cursor-pointer select-none items-center justify-center  motion-safe:transition-all']

  classNames.push(FONT_SIZE[props.size || config.size])

  if (props.variant !== 'simple') {
    classNames.push('border outline-none self-focus-ring')

    classNames.push(VARIANTS[props.variant] || VARIANTS.default)

    classNames.push(SIZES[props.size || config.size])
  }

  classNames.push(props.block ? 'flex w-full' : 'inline-flex')

  if (computedDisabled.value) {
    classNames.push(DISABLED_CLASS_NAMES)
  }

  if (props.shape) {
    classNames.push(
      props.shape === 'square'
        ? 'rounded-none'
        : 'rounded-full',
    )
  }

  return twMerge(classNames)
})

function onButtonClick(event: MouseEvent) {
  emits('click', event)
}
</script>

<template>
  <Component
    :is="as"
    role="button"
    :class="computedClasses"
    :disabled="computedDisabled"
    @click="onButtonClick"
  >
    <Spinner v-if="loading" />

    <slot name="prefix" />

    <span class="px-1.5 inline-flex truncate">
      <slot />
    </span>

    <slot name="suffix" />
  </Component>
</template>
