import { tv } from 'tailwind-variants'

export const switchVariant = tv({
  base: 'pxd-switch--label px-3 text-sm font-medium flex size-full items-center justify-center truncate rounded-sm text-foreground-secondary peer-focus-ring select-none peer-checked:bg-gray-100 peer-disabled:cursor-not-allowed peer-disabled:text-gray-800 empty:hidden motion-safe:transition-all',
  variants: {
    disabled: {
      true: '',
      false: 'peer-checked:text-foreground',
    },
  },
  defaultVariants: {
    disabled: false,
  },
})
