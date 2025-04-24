<script lang="ts" setup>
import type { VNode } from 'vue'
import { twMerge } from 'tailwind-merge'
import { computed, useAttrs } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import Spinner from '../spinner/index.vue'

interface Props {
  as?: keyof HTMLElementTagNameMap | 'router-link' | VNode
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  shape?: 'square' | 'rounded'
  block?: boolean
  loading?: boolean
  disabled?: boolean
}

defineOptions({
  name: 'PButton',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    as: 'button',
    variant: 'outline',
  },
)

const emits = defineEmits<{
  click: [MouseEvent]
}>()

const attrs = useAttrs()
const config = useConfigProvider()

const SIZES = {
  xs: 'px-1 rounded-md h-6 text-sm',
  sm: 'px-1.5 rounded-md h-7 text-sm',
  md: 'px-2.5 rounded-md h-8 text-sm',
  lg: 'px-3.5 rounded-lg h-9 text-base',
}

const VARIANTS = {
  outline: 'bg-background text-foreground hover:bg-background-hover active:bg-background-active border-input',
  ghost: 'bg-transparent text-foreground hover:bg-gray-alpha-200 active:bg-gray-alpha-300 border-transparent',
  primary: 'bg-foreground text-background hover:bg-foreground/80 active:bg-foreground border-transparent',
  error: 'bg-red-800 text-white  hover:bg-red-700 active:bg-red-800 border-transparent',
  warning: 'bg-amber-800 text-black hover:bg-amber-700 active:bg-amber-800 border-transparent',
  success: 'bg-green-800 text-white hover:bg-green-700 active:bg-green-800 border-transparent',
}

const DISABLED_CLASS_NAMES = 'is-disabled bg-gray-100 hover:bg-gray-100 active:bg-gray-100 cursor-not-allowed text-gray-700 border-gray-300'

const computedDisabled = computed(() => {
  return props.disabled || props.loading
})

const computedClassNames = computed(() => {
  const classNames = ['pxd-button cursor-pointer motion-safe:transition-colors items-center justify-center border']

  classNames.push(VARIANTS[props.variant] || VARIANTS.outline)

  classNames.push(SIZES[props.size || config.size])

  classNames.push(props.block ? 'flex ' : 'inline-flex')

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

  return twMerge(classNames, attrs.class as string)
})

function onButtonClick(event: MouseEvent) {
  emits('click', event)
}
</script>

<template>
  <Component
    :is="as"
    role="button"
    :class="computedClassNames"
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
