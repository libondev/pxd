import { tv } from 'tailwind-variants'

export const textareaVariant = tv({
  base: '',
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    },
    disabled: {
      true: 'is-disabled',
      false: '',
    },
    readonly: {
      true: 'is-readonly',
      false: '',
    },
    error: {
      true: 'is-error',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    disabled: false,
    readonly: false,
    error: false,
  },
})
