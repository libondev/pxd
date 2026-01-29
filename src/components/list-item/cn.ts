import { tv } from 'tailwind-variants'

export const listItemVariant = tv({
  base: 'pxd-list-item h-10 gap-3 px-2 text-sm flex w-full cursor-pointer items-center rounded-md outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700 group-data-[transition=true]/list:motion-safe:transition-colors',
  variants: {
    type: {
      error: 'text-red-900 pointer-coarse:active:bg-red-100 pointer-fine:data-[selected=true]:bg-red-100',
      warning: 'text-amber-900 pointer-coarse:active:bg-amber-100 pointer-fine:data-[selected=true]:bg-amber-100',
      default: 'text-foreground pointer-coarse:active:bg-gray-alpha-100 pointer-fine:data-[selected=true]:bg-gray-alpha-100',
      separator: 'h-0! px-0 m-1.5 w-auto! border-b',
    },
  },
  defaultVariants: {
    type: 'default',
  },
})
