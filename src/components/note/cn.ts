import { tv } from 'tailwind-variants'

export const noteVariant = tv({
  base: 'pxd-note gap-2 sm:flex-row sm:items-center flex max-w-full flex-col rounded-md border',
  variants: {
    size: {
      sm: 'px-2 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
    },
    variant: {
      success: {
        base: 'border-blue-500 text-blue-900',
        fill: 'border-blue-100 bg-blue-200 text-blue-900',
      },
      error: {
        base: 'border-red-500 text-red-900',
        fill: 'border-red-100 bg-red-200 text-red-900',
      },
      warning: {
        base: 'border-amber-500 text-amber-900',
        fill: 'border-amber-100 bg-amber-200 text-amber-900',
      },
      default: {
        base: 'border-input text-gray-900',
        fill: 'border-gray-100 bg-gray-200 text-gray-900',
      },
      primary: {
        base: 'border-gray-alpha-400 text-primary',
        fill: 'border-gray-100 bg-primary text-gray-100',
      },
      violet: {
        base: 'text-violet-900 border-violet-400',
        fill: 'text-violet-900 bg-violet-200 border-violet-100',
      },
      cyan: {
        base: 'border-teal-400 text-teal-900',
        fill: 'border-teal-100 bg-teal-200 text-teal-900',
      },
    },
    fill: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    { variant: 'success', fill: true, class: 'border-blue-100 bg-blue-200 text-blue-900' },
    { variant: 'success', fill: false, class: 'border-blue-500 text-blue-900' },
    { variant: 'error', fill: true, class: 'border-red-100 bg-red-200 text-red-900' },
    { variant: 'error', fill: false, class: 'border-red-500 text-red-900' },
    { variant: 'warning', fill: true, class: 'border-amber-100 bg-amber-200 text-amber-900' },
    { variant: 'warning', fill: false, class: 'border-amber-500 text-amber-900' },
    { variant: 'default', fill: true, class: 'border-gray-100 bg-gray-200 text-gray-900' },
    { variant: 'default', fill: false, class: 'border-input text-gray-900' },
    { variant: 'primary', fill: true, class: 'border-gray-100 bg-primary text-gray-100' },
    { variant: 'primary', fill: false, class: 'border-gray-alpha-400 text-primary' },
    { variant: 'violet', fill: true, class: 'text-violet-900 bg-violet-200 border-violet-100' },
    { variant: 'violet', fill: false, class: 'text-violet-900 border-violet-400' },
    { variant: 'cyan', fill: true, class: 'border-teal-100 bg-teal-200 text-teal-900' },
    { variant: 'cyan', fill: false, class: 'border-teal-400 text-teal-900' },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'default',
    fill: false,
  },
})
