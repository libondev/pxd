import type { ClassValue } from 'cnfast'
import { cn } from 'cnfast'
import { computed, useAttrs } from 'vue'

type TailwindVariantSchema = Record<string, Record<string, ClassValue>>
type TailwindVariantFallback = string | number | boolean
type TailwindVariantPrimitive<T> = T extends 'true'
  ? true
  : T extends 'false'
    ? false
    : T extends `${infer Value extends number}`
      ? Value
      : T
type TailwindVariantValue<T extends Record<string, ClassValue>> =
  | ([keyof T] extends [never]
      ? TailwindVariantFallback
      : Extract<keyof T, 'true' | 'false'> extends never
        ? TailwindVariantPrimitive<keyof T> | keyof T
        : boolean | keyof T)
  | null
  | undefined
type TailwindCompoundVariant<T extends TailwindVariantSchema> = Partial<{
  [K in keyof T]: TailwindVariantValue<T[K]> | ReadonlyArray<TailwindVariantValue<T[K]>>
}> & {
  class: ClassValue
}

export type TailwindVariantSelection<T extends TailwindVariantSchema> = Partial<{
  [K in keyof T]: TailwindVariantValue<T[K]>
}>

export interface TailwindVariantConfig<T extends TailwindVariantSchema> {
  base?: ClassValue
  variants?: T
  compoundVariants?: ReadonlyArray<TailwindCompoundVariant<T>>
}

export interface UseTailwindVariantOptions<T extends TailwindVariantSchema> {
  selection?: () => TailwindVariantSelection<T>
  mergeAttrsClass?: boolean
}

function createTailwindVariantResolver<T extends TailwindVariantSchema>(
  config: TailwindVariantConfig<T>,
) {
  const compoundVariants = config.compoundVariants?.map(({ class: classes, ...conditions }) => ({
    classes,
    conditions: Object.entries(conditions).map(([key, expected]): [string, string[]] => [
      key,
      (Array.isArray(expected) ? expected : [expected]).map(String),
    ]),
  }))

  return (selection: TailwindVariantSelection<T> = {}, additionalClasses?: ClassValue) => {
    const classes: ClassValue[] = [config.base]

    for (const key in selection) {
      if (!Object.hasOwn(selection, key)) {
        continue
      }

      const value = selection[key]

      if (value == null) {
        continue
      }

      const valueClasses = config.variants?.[key]?.[String(value)]

      if (valueClasses != null) {
        classes.push(valueClasses)
      }
    }

    if (compoundVariants) {
      compoundVariantLoop: for (const compoundVariant of compoundVariants) {
        for (const [key, expected] of compoundVariant.conditions) {
          if (!expected.includes(String(selection[key]))) {
            continue compoundVariantLoop
          }
        }

        classes.push(compoundVariant.classes)
      }
    }

    classes.push(additionalClasses)

    return cn(classes)
  }
}

export function createTailwindVariant<T extends TailwindVariantSchema>(
  config: TailwindVariantConfig<T>,
) {
  const resolveClasses = createTailwindVariantResolver(config)

  return (selection: TailwindVariantSelection<T> = {}) => resolveClasses(selection)
}

export function useTailwindVariant<T extends TailwindVariantSchema>(
  config: TailwindVariantConfig<T>,
  options: UseTailwindVariantOptions<T> = {},
) {
  const rawAttrs = useAttrs()
  const shouldMergeAttrsClass = options.mergeAttrsClass !== false
  const resolveClasses = createTailwindVariantResolver(config)

  const attrs = computed(() => {
    if (!shouldMergeAttrsClass) {
      return rawAttrs
    }

    const { class: _class, ...restAttrs } = rawAttrs

    return restAttrs
  })

  const classes = computed(() =>
    resolveClasses(options.selection?.(), shouldMergeAttrsClass ? rawAttrs.class : undefined),
  )

  return {
    attrs,
    classes,
  }
}
