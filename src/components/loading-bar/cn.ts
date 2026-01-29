import { tv } from 'tailwind-variants'

export const loadingBarVariant = tv({
  slots: {
    wrapper: 'pxd-loading-bar top-0 left-0 right-0 h-1 pointer-events-none z-10 max-w-full overflow-hidden',
    inner: 'pxd-loading-bar--inner size-full origin-left rounded-r-full motion-safe:transition-all',
  },
  variants: {
    status: {
      running: {
        inner: 'bg-gray-500',
      },
      finish: {
        inner: 'bg-primary',
      },
      error: {
        inner: 'bg-red-900',
      },
    },
    hidden: {
      true: {
        wrapper: 'opacity-0',
      },
      false: {
        wrapper: '',
      },
    },
    absolute: {
      true: {
        wrapper: 'absolute',
      },
      false: {
        wrapper: 'fixed',
      },
    },
  },
  defaultVariants: {
    status: 'finish',
    hidden: false,
    absolute: false,
  },
})
