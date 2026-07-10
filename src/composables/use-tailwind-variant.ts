import type { ClassValue } from 'cnfast'
import { cn } from 'cnfast'
import { computed, useAttrs } from 'vue'

type TailwindVariantValue = string | number | boolean | null | undefined
type TailwindVariantValues = TailwindVariantValue | TailwindVariantValue[]
type TailwindVariantSchema = Record<string, Record<string, ClassValue>>
type TailwindVariantSelection<T extends TailwindVariantSchema> = Partial<
  Record<keyof T, TailwindVariantValue>
>
type TailwindCompoundVariant<T extends TailwindVariantSchema> = Partial<
  Record<keyof T, TailwindVariantValues>
> & {
  class: ClassValue
}

interface UseTailwindVariantConfig<T extends TailwindVariantSchema> {
  base?: ClassValue
  variants?: T
  compoundVariants?: Array<TailwindCompoundVariant<T>>
}

interface UseTailwindVariantOptions {
  mergeAttrsClass?: boolean
}

function isVariantValueMatched(value: TailwindVariantValue, expected: TailwindVariantValue) {
  return String(value) === String(expected)
}

function isCompoundVariantMatched<T extends TailwindVariantSchema>(
  compoundVariant: TailwindCompoundVariant<T>,
  selection: TailwindVariantSelection<T>,
) {
  return Object.entries(compoundVariant).every(([key, expected]) => {
    if (key === 'class') {
      return true
    }

    const value = selection[key]

    if (Array.isArray(expected)) {
      return expected.some((item) => isVariantValueMatched(value, item))
    }

    return isVariantValueMatched(value, expected as TailwindVariantValue)
  })
}

export function useTailwindVariant<T extends TailwindVariantSchema>(
  config: UseTailwindVariantConfig<T>,
  options: UseTailwindVariantOptions = {},
) {
  const rawAttrs = useAttrs()
  const shouldMergeAttrsClass = options.mergeAttrsClass !== false

  const attrs = computed(() => {
    if (!shouldMergeAttrsClass) {
      return rawAttrs
    }

    const { class: _class, ...restAttrs } = rawAttrs

    return restAttrs
  })

  function classes(selection: TailwindVariantSelection<T> = {}) {
    const variantClasses = Object.entries(selection).map(([key, value]) => {
      if (value == null) {
        return undefined
      }

      const valueClasses = config.variants?.[key]?.[String(value)]

      if (valueClasses == null) {
        return undefined
      }

      return valueClasses
    })

    const compoundVariantClasses = config.compoundVariants
      ?.filter((compoundVariant) => isCompoundVariantMatched(compoundVariant, selection))
      .map((compoundVariant) => compoundVariant.class)

    return cn(
      config.base,
      variantClasses,
      compoundVariantClasses,
      shouldMergeAttrsClass ? (rawAttrs.class as ClassValue) : undefined,
    )
  }

  return {
    attrs,
    classes,
  }
}
