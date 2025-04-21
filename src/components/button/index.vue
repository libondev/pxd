<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import { computed, useAttrs } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'

interface Props {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  disabled?: boolean
  block?: boolean
  href?: string
  class?: string | object | any[]
  shape?: 'square' | 'rounded'
}

defineOptions({
  name: 'PButton',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    variant: 'outline',
  },
)

const config = useConfigProvider()

const SIZES = {
  xs: 'px-1 rounded-md h-6 text-sm ',
  sm: 'px-1.5 rounded-md h-7 text-sm ',
  md: 'px-2.5 rounded-md h-8 text-sm ',
  lg: 'px-3.5 rounded-lg h-9 text-base ',
}

const VARIANTS = {
  outline: 'bg-background text-foreground hover:bg-background-hover active:bg-background-active border-input ',
  ghost: 'bg-transparent text-foreground hover:bg-gray-alpha-200 active:bg-gray-alpha-300 border-transparent ',
  primary: 'bg-foreground text-background hover:bg-foreground/80 active:bg-foreground border-transparent ',
  error: 'bg-red-800 text-white  hover:bg-red-700 active:bg-red-800 border-transparent ',
  warning: 'bg-amber-800 text-black hover:bg-amber-700 active:bg-amber-800 border-transparent ',
  success: 'bg-green-800 text-white hover:bg-green-700 active:bg-green-800 border-transparent ',
}

const DISABLED_CLASS_NAMES = 'is-disabled disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 border-gray-300  '

const computedClassNames = computed(() => {
  let classNames = 'pxd-button cursor-pointer transition-colors items-center justify-center border '

  classNames += (VARIANTS[props.variant] || VARIANTS.outline)

  classNames += SIZES[props.size || config.size]

  classNames += props.block ? 'flex ' : 'inline-flex '

  if (props.disabled) {
    classNames += DISABLED_CLASS_NAMES
  }

  if (props.shape === 'square') {
    classNames += 'rounded-none '
  }
  else if (props.shape === 'rounded') {
    classNames += 'rounded-full '
  }

  return twMerge(classNames, props.class as string)
})

const renderAs = computed(() => {
  const to = props.href

  if (to) {
    if (['/', '#'].includes(to.slice(0, 1))) {
      return 'router-link'
    }

    return 'a'
  }

  return 'button'
})

const linkPropName = computed(() => {
  return renderAs.value === 'a' ? 'href' : 'to'
})
</script>

<template>
  <Component
    :is="renderAs"
    :class="computedClassNames"
    :disabled="disabled"
    :[linkPropName]="href"
  >
    <slot name="prefix" />

    <span class="px-1 inline-flex truncate">
      <slot />
    </span>

    <slot name="suffix" />
  </Component>
</template>
