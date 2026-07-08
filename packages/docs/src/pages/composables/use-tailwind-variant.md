# useTailwindVariant

A composable for building variant-based Tailwind class compositions, similar to CVA (Class Variance Authority) but integrated with Vue's reactivity and `useAttrs`.

## Exports

```ts
function useTailwindVariant<T extends TailwindVariantSchema>(
  config: UseTailwindVariantConfig<T>,
  options?: UseTailwindVariantOptions,
): {
  attrs: ComputedObject<Record<string, unknown>>
  classes: (selection?: TailwindVariantSelection<T>) => string
}
```

## Types

```ts
type TailwindVariantValue = string | number | boolean | null | undefined
type TailwindVariantValues = TailwindVariantValue | TailwindVariantValue[]
type TailwindVariantClassValue = ClassValue | Record<string, ClassValue>
type TailwindVariantSchema = Record<string, Record<string, TailwindVariantClassValue>>
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
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `config.base` | `ClassValue` | Base classes always applied to the element |
| `config.variants` | `TailwindVariantSchema` | Variant definitions mapping variant names to their possible values and corresponding classes |
| `config.compoundVariants` | `Array<TailwindCompoundVariant<T>>` | Additional class combinations applied when multiple variant conditions are met simultaneously |
| `options.mergeAttrsClass` | `boolean` | Whether to merge the `class` from `$attrs` into the computed classes and exclude it from `attrs`. Defaults to `true` |

## Returns

| Name | Type | Description |
| --- | --- | --- |
| `attrs` | `ComputedObject<Record<string, unknown>>` | Component attrs with `class` removed (when `mergeAttrsClass` is `true`), ready to be spread on the element |
| `classes` | `(selection?) => string` | Function that accepts a variant selection object and returns the composed class string |

## Usage

```vue
<script setup lang="ts">
import { useTailwindVariant } from 'pxd'

const { attrs, classes } = useTailwindVariant({
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      ghost: 'bg-transparent hover:bg-gray-100',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    },
  },
  compoundVariants: [
    {
      variant: 'primary',
      size: 'lg',
      class: 'shadow-lg',
    },
  ],
})
</script>

<template>
  <button v-bind="attrs" :class="classes({ variant: 'primary', size: 'md' })">
    <slot />
  </button>
</template>
```

### Compound variants with multiple values

Compound variants support array values to match any of the listed values:

```ts
const { classes } = useTailwindVariant({
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white',
      danger: 'bg-red-500 text-white',
      ghost: 'bg-transparent',
    },
    size: {
      sm: 'h-8 text-sm',
      lg: 'h-12 text-lg',
    },
  },
  compoundVariants: [
    {
      // Applied when variant is 'primary' OR 'danger', and size is 'lg'
      variant: ['primary', 'danger'],
      size: 'lg',
      class: 'shadow-lg',
    },
  ],
})
```

### Nested class objects

Variant values can be objects for conditional class application (powered by `cnfast`):

```ts
const { classes } = useTailwindVariant({
  variants: {
    variant: {
      primary: {
        'bg-blue-500 text-white': true,
        'shadow-lg': false,
      },
    },
  },
})
```

### Disabling attrs class merging

Set `mergeAttrsClass: false` to keep `class` in `attrs` and not merge it into the computed classes:

```ts
const { attrs, classes } = useTailwindVariant(config, {
  mergeAttrsClass: false,
})
```
