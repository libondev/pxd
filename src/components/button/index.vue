<script lang="ts" setup>
import type { ButtonProps } from '../../types/components/button'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { isTruthyProp } from '../../utils/format'
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
  xs: 'h-6 px-1',
  sm: 'h-7.5 px-1.5',
  md: 'h-9 px-2.5',
  lg: 'h-10 px-3.5',
}

const ROUNDED = {
  xs: 'rounded-md',
  sm: 'rounded-md',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  square: 'rounded-none',
  rounded: 'rounded-full',
}

const FONT_SIZES = {
  xs: 'text-sm',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
}

const VARIANTS = {
  simple: '',
  default: 'bg-background-100 text-foreground hover:bg-background-hover active:bg-background-active border-input',
  ghost: 'bg-transparent text-foreground hover:bg-background-hover active:bg-background-active border-transparent',
  primary: 'bg-primary text-gray-100 hover:bg-primary/80 active:bg-gray-900 border-transparent',
  error: 'bg-red-800 text-white hover:bg-red-700 active:bg-red-900 border-transparent',
  warning: 'bg-amber-800 text-black hover:bg-amber-700 active:bg-amber-900 border-transparent',
  success: 'bg-green-800 text-white hover:bg-green-700 active:bg-green-900 border-transparent',
}

const ALIGNMENTS = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

const DISABLED_CLASS_NAMES = 'is-disabled bg-gray-100 hover:bg-gray-100 active:bg-gray-100 disabled:cursor-not-allowed text-gray-700 border-gray-300'

const config = useConfigProvider()
const computedDisabled = computed(() => isTruthyProp(props.disabled) || isTruthyProp(props.loading))

const computedClass = computed(() => {
  const classes = ['pxd-button shrink-0 cursor-pointer touch-manipulation items-center select-none motion-safe:transition-all', ALIGNMENTS[props.align]]

  const { variant, block, shape, icon } = props

  classes.push(
    isTruthyProp(block) ? 'flex w-full' : 'inline-flex',
    getFallbackValue(props.size, FONT_SIZES, config.size),
    shape ? ROUNDED[shape] : getFallbackValue(props.size, ROUNDED, config.size),
  )

  if (isTruthyProp(icon)) {
    classes.push('aspect-square !p-0')
  }

  if (variant !== 'simple') {
    classes.push(
      'border outline-none self-focus-ring',
      getFallbackValue(variant, VARIANTS),
      getFallbackValue(props.size, SIZES, config.size),
    )
  }

  if (computedDisabled.value) {
    classes.push(DISABLED_CLASS_NAMES)
  }

  return classes.join(' ')
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

    <span class="inline-flex items-center truncate" :class="{ 'px-1.5': !icon }">
      <slot />
    </span>

    <slot name="suffix" />
  </component>
</template>
