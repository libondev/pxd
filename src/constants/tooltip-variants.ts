export const TOOLTIP_VARIANTS = {
  invert: {
    bg: 'var(--color-background-100)',
    base: 'text-foreground border variant-invert',
  },
  default: {
    bg: 'var(--color-gray-1000)',
    base: 'text-gray-100',
  },
  error: {
    bg: 'var(--color-red-700)',
    base: 'text-gray-100 dark:text-gray-1000',
  },
  warning: {
    bg: 'var(--color-amber-700)',
    base: 'text-gray-1000 dark:text-gray-100',
  },
  success: {
    bg: 'var(--color-green-700)',
    base: 'text-gray-100 dark:text-gray-1000',
  },
  violet: {
    bg: 'var(--color-purple-700)',
    base: 'text-gray-100 dark:text-gray-1000',
  },
}

export const TOOLTIP_CONTENT_CLASS =
  'rounded-md text-[13px] break-words whitespace-pre-line bg-(--popover-arrow-color) motion-safe:transition-colors'

export type TooltipVariant = keyof typeof TOOLTIP_VARIANTS
