import { shadowBorder } from '@/_utils/style'

export const inputBorder = {
  base: `focus-within:!shadow-[0_0_0_1px_var(--gray-alpha-600),0_0_0_3px_rgba(0,0,0,.16)]`,
  error: `shadow-[0_0_0_1px_hsl(var(--red-900-value)),0_0_0_3px_hsl(var(--red-300-value))] [&:not([data-disabled=true])]:hover:shadow-[0_0_0_1px_hsl(var(--red-900-value)),0_0_0_3px_hsl(var(--red-500-value))]`,
  default: `${shadowBorder} [&:not([data-disabled=true])]:hover:shadow-[0_0_0_1px_var(--gray-alpha-500)]`,
}

export { default } from './src/input.vue'
