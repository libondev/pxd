<script lang="ts" setup>
defineOptions({
  name: 'PButton',
})

const props = withDefaults(
  defineProps<{
    type?: HTMLButtonElement['type']
    variant?: keyof typeof VARIANTS
    disabled?: boolean
    loading?: boolean
    shadow?: boolean
    shape?: 'normal' | 'square' | 'rounded' | 'circle'
  }>(),
  {
    type: 'button',
    variant: 'default',
    disabled: false,
    shape: 'normal',
    shadow: true,
  },
)

const VARIANTS = {
  default: 'bg-gray-1000 text-background-100 border-transparent hover:opacity-90 active:opacity-80',
  secondary: 'bg-gray-100 text-gray-1000 border-transparent hover:bg-gray-200 active:bg-gray-alpha-300',
  danger: 'bg-red-800 text-background-100 border-transparent hover:opacity-90 active:opacity-80',
  warning: 'bg-amber-800 text-background-100 border-transparent hover:opacity-90 active:opacity-80',
  outline: 'text-gray-1000 bg-background-100 border-gray-alpha-400 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'bg-transparent text-gray-1000 border-transparent hover:bg-gray-100 active:bg-gray-200',
  link: 'bg-transparent text-gray-1000 border-transparent underline underline-offset-4 hover:opacity-90 active:opacity-70',
}

const SHAPES = {
  normal: 'rounded-md',
  square: 'rounded-none',
  rounded: 'rounded-full',
  circle: 'rounded-full overflow-hidden w-8 !p-1',
}

const enableShadow = computed(() => props.shadow && !['ghost', 'link'].includes(props.variant))
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="pxd-button inline-flex items-center h-8 px-2 select-none border font-inherit b-(1 solid) justify-center text-sm cursor-pointer disabled:pointer-events-none disabled:!bg-gray-100 disabled:!text-gray-700 disabled:!border-gray-400"
    :class="[VARIANTS[variant], SHAPES[shape], { 'shadow-sm': enableShadow }]"
  >
    <svg v-if="loading" xmlns="http://www.w3.org/2000/svg" class="animate-spin" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8" /></svg>

    <slot name="prefix" />

    <span class="px-1">
      <slot />
    </span>

    <slot name="suffix" />
  </button>
</template>
