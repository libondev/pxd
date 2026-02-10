import { tv } from 'tailwind-variants'

export const loadingBarVariant = tv({
  slots: {
    wrapper:
      'pxd-loading-bar top-0 left-0 right-0 pointer-events-none z-10 max-w-full overflow-hidden',
    inner:
      'pxd-loading-bar--inner h-0.5 data-[hidden=true]:h-0 origin-left data-[transition=false]:transition-none! motion-safe:transition-all',
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
    absolute: false,
  },
})
