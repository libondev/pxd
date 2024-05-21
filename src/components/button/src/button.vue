<script lang="ts" setup>
defineOptions({
  name: 'PButton',
})

defineProps({
  type: {
    type: String as PropType<HTMLButtonElement['type']>,
    default: 'button',
  },
  variant: {
    type: String as PropType<keyof typeof VARIANTS>,
    default: 'default',
  },
})

const VARIANTS = {
  default: 'shadow-sm bg-primary text-primary-foreground not-disabled:(hover:bg-primary/75 active:bg-primary/90)',
  secondary: 'shadow-sm bg-secondary text-secondary-foreground not-disabled:(hover:bg-input/75 active:bg-input)',
  danger: 'shadow-sm bg-danger text-danger-foreground not-disabled:(hover:bg-danger/75 active:bg-danger/90)',
  outline: 'shadow-sm !b-input text-primary bg-background not-disabled:(hover:bg-secondary active:bg-input)',
  ghost: 'bg-transparent text-primary not-disabled:(hover:bg-secondary active:bg-input)',
  link: 'bg-transparent text-primary underline-offset-3 not-disabled:(hover:underline hover:bg-secondary active:bg-input)',
}
</script>

<template>
  <button
    :type="type"
    class="pxd-button inline-flex items-center h-8 rounded px-3 py-2 font-inherit b-(1 solid) b-transparent justify-center outlines text-sm not-disabled:cursor-pointer disabled:(pointer-events-none op-50)"
    :class="[VARIANTS[variant]]"
  >
    <slot />
  </button>
</template>
