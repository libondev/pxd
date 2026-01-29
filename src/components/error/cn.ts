import { tv } from 'tailwind-variants'

export const errorVariant = tv({
  base: 'pxd-error flex text-red-900',
  variants: {
    size: {
      xs: 'text-xs [--mt:2px]',
      sm: 'text-13px [--mt:2px]',
      md: 'text-sm [--mt:2px]',
      lg: 'text-base [--mt:4px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
