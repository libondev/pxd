import { tv } from 'tailwind-variants'

export const checkboxVariant = tv({
  slots: {
    wrapper:
      'pxd-checkbox group/checkbox gap-2 inline-flex max-w-full cursor-pointer touch-manipulation items-center data-[disabled=true]:cursor-not-allowed',
    inner:
      'pxd-checkbox--inner size-4 inline-flex shrink-0 transform-gpu items-center justify-center overflow-hidden rounded-sm border peer-focus-ring motion-safe:transition-colors',
  },
  variants: {
    checked: {
      true: {
        inner: 'border-primary bg-primary',
      },
      false: {
        inner: 'border-gray-alpha-400 bg-background-100 group-hover/checkbox:bg-gray-200',
      },
    },
    disabled: {
      true: {
        wrapper: 'is-disabled text-gray-500',
        inner: '',
      },
      false: {
        wrapper: '',
        inner: '',
      },
    },
  },
  compoundVariants: [
    { checked: true, disabled: true, inner: 'border-gray-600 bg-gray-600' },
    { checked: false, disabled: true, inner: 'border-gray-500 bg-gray-100' },
  ],
})
