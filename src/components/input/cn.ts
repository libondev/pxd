import { tv } from 'tailwind-variants'

export const inputVariant = tv({
  base: 'pxd-input pxd-input--border group relative flex w-full max-w-full items-center overflow-hidden bg-background-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-gray-100 motion-safe:transition-all',
  variants: {
    size: {
      xs: 'h-6 text-xs rounded-sm',
      sm: 'h-7.5 text-sm rounded-md',
      md: 'h-9 text-sm rounded-md',
      lg: 'h-10 text-base rounded-lg',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
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
    align: 'left',
    disabled: false,
    readonly: false,
    error: false,
  },
})
