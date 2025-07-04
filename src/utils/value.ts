export function getFallbackValue<
  Variants extends Record<string, any>,
>(variant: string | undefined, variants: Variants, defaultVariant: keyof Variants = 'default') {
  return (variant ? variants[variant] : null) ?? variants[defaultVariant]
}
