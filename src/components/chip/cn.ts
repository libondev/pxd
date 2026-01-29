import { tv } from 'tailwind-variants'

export const chipVariant = tv({
  base: 'pxd-chip--label text-xs top-0 right-0 absolute rounded-full border border-background-100 motion-safe:transition-all',
  variants: {
    variant: {
      primary: 'bg-primary text-background-100',
      error: 'bg-red-700 text-background-100 dark:text-gray-1000',
      warning: 'bg-amber-700 text-gray-1000 dark:text-gray-100',
      success: 'bg-green-700 text-background-100 dark:text-gray-1000',
      secondary: 'bg-gray-700 text-background-100 dark:text-gray-1000',
    },
    inset: {
      true: {},
      false: 'translate-x-1/2 -translate-y-1/3',
    },
    hasLabel: {
      true: {},
      false: 'size-(--chip-size)',
    },
  },
  defaultVariants: {
    variant: 'primary',
    inset: false,
    hasLabel: false,
  },
})
