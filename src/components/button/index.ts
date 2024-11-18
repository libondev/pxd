import type { StandardSize } from '#types'
import { getStandardSize } from '#utils/css.js'

export const getButtonSizes = getStandardSize({
  default: 'px-2',
  small: 'px-1.5',
  large: 'px-2.5',
})

export const buttonShapes = {
  normal: 'rounded-md',
  square: 'rounded-none',
  rounded: 'rounded-full',
  circle: 'rounded-full overflow-hidden w-8 !p-1',
}

export const buttonVariants = {
  base: 'inline-flex items-center select-none border font-inherit b-(1 solid) justify-center cursor-pointer text-sm disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-400',
  default: 'bg-gray-1000 text-background-100 border-transparent enabled:hover:opacity-90 enabled:active:opacity-80',
  secondary: 'bg-gray-100 text-gray-1000 border-transparent enabled:hover:bg-gray-200 enabled:active:bg-gray-alpha-300',
  danger: 'bg-red-800 text-background-100 border-transparent enabled:hover:opacity-90 enabled:active:opacity-80',
  warning: 'bg-amber-800 text-gray-1000 border-transparent enabled:hover:opacity-90 enabled:active:opacity-80',
  outline: 'text-gray-1000 bg-background-100 border-gray-alpha-400 enabled:hover:bg-gray-100 enabled:active:bg-gray-200',
  ghost: 'bg-transparent text-gray-1000 border-transparent enabled:hover:bg-gray-100 enabled:active:bg-gray-200',
  underline: 'bg-transparent text-gray-1000 border-transparent underline underline-offset-4 enabled:hover:opacity-90 enabled:active:opacity-70',
}

export type ButtonSizes = StandardSize
export type ButtonShapes = keyof typeof buttonShapes
export type ButtonVariants = keyof typeof buttonVariants

export function getButtonVariant(variant: ButtonVariants, withBase = true) {
  return (buttonVariants[variant] || buttonVariants.default) + (withBase ? ` ${buttonVariants.base}` : '')
}

export { default } from './src/button.vue'
