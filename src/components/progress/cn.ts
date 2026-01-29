import { tv } from 'tailwind-variants'

export const progressVariant = tv({
  base: 'pxd-progress-bar flex-1 shrink-0 overflow-hidden rounded-full bg-gray-200',
  variants: {
    size: {
      sm: 'h-2',
      md: 'h-2.5',
      lg: 'h-3.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
