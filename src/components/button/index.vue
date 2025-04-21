<script lang="ts" setup>
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'

interface Props {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  disabled?: boolean
  block?: boolean
  href?: string
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

const DISABLED_CLASS_NAMES = 'is-disabled disabled:bg-gray-100 !text-gray-700 border-none shadow-[0_0_0_1px_hsl(var(--gray-200-value))] !cursor-not-allowed '

const computedClassNames = computed(() => {
  let classNames = ''

  classNames += (VARIANTS[props.variant] || VARIANTS.outline)

  classNames += SIZES[props.size || config.size]

  classNames += props.block ? 'flex ' : 'inline-flex '

  if (props.disabled) {
    classNames += DISABLED_CLASS_NAMES
  }

  if (props.shape === 'square') {
    classNames += '!rounded-none '
  }
  else if (props.shape === 'rounded') {
    classNames += '!rounded-full '
  }

  return classNames
})
</script>

<template>
  <Component
    :is="props.href ? 'router-link' : 'button'"
    class="pxd-button cursor-pointer transition-colors items-center justify-center border"
    :class="computedClassNames"
    :disabled="disabled"
    :to="href"
  >
    <slot name="prefix" />

    <span class="px-1 inline-flex truncate">
      <slot />
    </span>

    <slot name="suffix" />
  </Component>
</template>
