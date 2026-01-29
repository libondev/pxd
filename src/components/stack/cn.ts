import { tv } from 'tailwind-variants'

export const stackVariant = tv({
  base: 'pxd-stack flex max-w-full gap-(--xs) [--xs:1rem]',
  variants: {
    wrap: {
      true: 'flex-wrap',
      false: '',
    },
    align: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      between: 'items-between',
      around: 'items-around',
      evenly: 'items-evenly',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'flex-start',
      end: 'flex-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
      stretch: 'justify-stretch',
    },
  },
  defaultVariants: {
    wrap: true,
    align: 'start',
    justify: 'start',
  },
})
