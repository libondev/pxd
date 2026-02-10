import { tv } from 'tailwind-variants'

export const radioVariant = tv({
  base: 'pxd-radio--inner size-4 after:content-empty after:size-2 inline-flex items-center justify-center rounded-full border peer-focus-ring after:scale-40 after:rounded-full after:bg-primary after:opacity-0 peer-checked:after:scale-100 peer-checked:after:opacity-100 motion-safe:transition-colors motion-safe:after:transition-all',
  variants: {
    checked: {
      true: {
        base: 'border-primary bg-background-100 peer-checked:after:scale-100',
        disabled: 'border-gray-500 bg-gray-100 peer-disabled:after:bg-gray-500',
      },
      false: {
        base: 'border-gray-alpha-400 bg-background-100 group-hover/radio:bg-gray-200',
        disabled: 'border-gray-500 bg-gray-100',
      },
    },
    disabled: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      checked: true,
      disabled: false,
      class: 'border-primary bg-background-100 peer-checked:after:scale-100',
    },
    {
      checked: true,
      disabled: true,
      class: 'border-gray-500 bg-gray-100 peer-disabled:after:bg-gray-500',
    },
    {
      checked: false,
      disabled: false,
      class: 'border-gray-alpha-400 bg-background-100 group-hover/radio:bg-gray-200',
    },
    { checked: false, disabled: true, class: 'border-gray-500 bg-gray-100' },
  ],
  defaultVariants: {
    checked: false,
    disabled: false,
  },
})
