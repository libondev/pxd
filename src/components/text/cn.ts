import { tv } from 'tailwind-variants'

export const textVariant = tv({
  base: 'pxd-text m-0',
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    monospace: {
      true: 'font-mono',
      false: '',
    },
    secondary: {
      true: 'text-foreground-secondary',
      false: '',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
    lineClamp: {
      true: 'line-clamp',
      false: '',
    },
  },
  defaultVariants: {
    align: 'left',
    monospace: false,
    secondary: false,
    truncate: false,
    lineClamp: false,
  },
})
