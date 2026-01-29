import { tv } from 'tailwind-variants'

export const pinInputVariant = tv({
  base: 'pxd-input--border rounded-md motion-safe:transition-all',
  variants: {
    size: {
      xs: 'w-6 text-xs',
      sm: 'w-7.5 text-sm',
      md: 'w-9 text-sm',
      lg: 'w-10 text-base',
    },
    error: {
      true: 'is-error',
      false: '',
    },
    disabled: {
      true: 'is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    error: false,
    disabled: false,
  },
})
