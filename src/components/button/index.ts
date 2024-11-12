export const buttonVariants = {
  base: 'inline-flex items-center h-8 px-2 select-none border font-inherit b-(1 solid) justify-center text-sm cursor-pointer disabled:pointer-events-none disabled:!bg-gray-100 disabled:!text-gray-700 disabled:!border-gray-400',
  default: 'bg-gray-1000 text-background-100 border-transparent hover:opacity-90 active:opacity-80',
  secondary: 'bg-gray-100 text-gray-1000 border-transparent hover:bg-gray-200 active:bg-gray-alpha-300',
  danger: 'bg-red-800 text-background-100 border-transparent hover:opacity-90 active:opacity-80',
  warning: 'bg-amber-800 text-background-100 border-transparent hover:opacity-90 active:opacity-80',
  outline: 'text-gray-1000 bg-background-100 border-gray-alpha-400 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'bg-transparent text-gray-1000 border-transparent hover:bg-gray-100 active:bg-gray-200',
  underline: 'bg-transparent text-gray-1000 border-transparent underline underline-offset-4 hover:opacity-90 active:opacity-70',
}

export { default } from './src/button.vue'
