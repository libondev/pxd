const SIZES = {
  sm: 'h-7 rounded-md px-2',
  default: 'h-8 rounded px-3 py-2',
  lg: 'h-9 rounded-md px-4',
}

declare global {
  export type Sizes = keyof typeof SIZES
}

export const getSizes = (size: Sizes) => SIZES[size] || SIZES.default
