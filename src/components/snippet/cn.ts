import { tv } from 'tailwind-variants'

export const snippetVariant = tv({
  base: 'pxd-snippet pr-12 relative flex items-center rounded-lg border motion-safe:transition-all',
  variants: {
    size: {
      sm: 'min-h-7.5 pl-3.5 pr-1.5 py-2 text-sm',
      md: 'min-h-9 pl-3.5 pr-2.5 py-2.5 text-sm',
      lg: 'min-h-10 pl-3.5 pr-3.5 py-3 text-base',
    },
    variant: {
      default: 'border-gray-alpha-300 bg-background-100',
      primary: 'border-gray-alpha-300 bg-primary text-gray-100',
      success: 'border-gray-alpha-300 bg-blue-200 text-blue-900',
      error: 'border-gray-alpha-300 bg-red-200 text-red-900',
      warning: 'border-gray-alpha-300 bg-amber-200 text-amber-900',
    },
    prompt: {
      true: 'pxd-snippet--prompt',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
    prompt: false,
  },
})
