import { tv } from 'tailwind-variants'

export const skeletonVariant = tv({
  base: 'pxd-skeleton relative block shrink-0 overflow-hidden',
  variants: {
    loading: {
      true: 'loading invisible',
      false: '',
    },
    shape: {
      default: 'rounded-md',
      square: 'rounded-none',
      rounded: 'rounded-full',
    },
    animated: {
      true: 'animated after:default-animation-timing-function!',
      false: '',
    },
  },
  defaultVariants: {
    loading: true,
    shape: 'default',
    animated: true,
  },
})
