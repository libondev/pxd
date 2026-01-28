import { tv } from 'tailwind-variants'

export type BadgeVariant = 'pill' | 'gray' | 'blue' | 'purple' | 'amber' | 'red' | 'pink' | 'green' | 'teal' | 'gray-subtle' | 'blue-subtle' | 'purple-subtle' | 'amber-subtle' | 'red-subtle' | 'pink-subtle' | 'green-subtle' | 'teal-subtle' | 'inverted' | 'vue' | 'trial' | 'turborepo'

export type BadgeSize = 'sm' | 'md' | 'lg'

export const badgeVariant = tv({
  base: 'pxd-badge font-medium gap-1 inline-flex items-center justify-center rounded-full font-sans text-nowrap whitespace-nowrap no-underline! motion-safe:transition-all',
  variants: {
    variant: {
      'pill': 'bg-background-100',
      'gray': 'text-white bg-gray-600',
      'blue': 'bg-blue-700 text-gray-100 dark:text-gray-1000',
      'purple': 'bg-purple-700 text-gray-100 dark:text-gray-1000',
      'amber': 'bg-amber-700 text-gray-1000 dark:text-gray-100',
      'red': 'bg-red-700 text-gray-100 dark:text-gray-1000',
      'pink': 'bg-pink-700 text-gray-100 dark:text-gray-1000',
      'green': 'bg-green-700 text-gray-100 dark:text-gray-1000',
      'teal': 'bg-teal-700 text-gray-100 dark:text-gray-1000',
      'gray-subtle': 'bg-gray-200 text-gray-1000',
      'blue-subtle': 'bg-blue-200 text-blue-900',
      'purple-subtle': 'bg-purple-200 text-purple-900',
      'amber-subtle': 'bg-amber-200 text-amber-900',
      'red-subtle': 'bg-red-200 text-red-900',
      'pink-subtle': 'bg-pink-200 text-pink-900',
      'green-subtle': 'bg-green-200 text-green-900',
      'teal-subtle': 'bg-teal-200 text-teal-900',
      'inverted': 'bg-gray-1000 text-gray-100',
      'vue': 'text-gray-100 dark:text-gray-1000',
      'trial': 'text-gray-100 dark:text-gray-1000',
      'turborepo': 'text-gray-100 dark:text-gray-1000',
    },
    size: {
      sm: 'px-2 h-5 text-xs',
      md: 'px-2.5 h-6 text-xs',
      lg: 'px-3 h-7.5 text-sm',
    },
  },
  compoundVariants: [
    { variant: 'pill', class: 'pill' },
    { variant: 'vue', class: 'vue' },
    { variant: 'trial', class: 'trial' },
    { variant: 'turborepo', class: 'turborepo' },
  ],
  defaultVariants: {
    variant: 'gray',
    size: 'md',
  },
})
