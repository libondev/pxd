# useTailwindVariant

A composable for building reactive, variant-based Tailwind class compositions. It integrates class resolution with Vue reactivity and `useAttrs`.

Use `createTailwindVariant` instead when the same variant configuration needs to resolve multiple selections.

## Exports

```ts
function useTailwindVariant<T extends TailwindVariantSchema>(
  config: TailwindVariantConfig<T>,
  options?: UseTailwindVariantOptions<T>,
): {
  attrs: ComputedObject<Record<string, unknown>>
  classes: ComputedRef<string>
}

function createTailwindVariant<T extends TailwindVariantSchema>(
  config: TailwindVariantConfig<T>,
): (selection?: TailwindVariantSelection<T>) => string
```

## Types

```ts
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

interface TailwindVariantConfig<T extends TailwindVariantSchema> {
  base?: ClassValue
  variants?: T
  compoundVariants?: Array<TailwindCompoundVariant<T>>
}

interface UseTailwindVariantOptions<T extends TailwindVariantSchema> {
  selection?: () => TailwindVariantSelection<T>
  mergeAttrsClass?: boolean
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `config.base` | `ClassValue` | Base classes always applied to the element |
| `config.variants` | `TailwindVariantSchema` | Variant definitions mapping variant names to their possible values and corresponding classes |
| `config.compoundVariants` | `Array<TailwindCompoundVariant<T>>` | Additional class combinations applied when multiple variant conditions are met simultaneously |
| `options.selection` | `() => TailwindVariantSelection<T>` | Optional reactive getter for the current variant selection. Defaults to an empty selection |
| `options.mergeAttrsClass` | `boolean` | Whether to merge the `class` from `$attrs` into the computed classes and exclude it from `attrs`. Defaults to `true` |

## Returns

| Name | Type | Description |
| --- | --- | --- |
| `attrs` | `ComputedRef<Record<string, unknown>>` | Component attrs with `class` removed (when `mergeAttrsClass` is `true`), ready to be spread on the element |
| `classes` | `ComputedRef<string>` | Reactive class string resolved from `options.selection` and `$attrs.class` |

## Usage

```vue
<script setup lang="ts">
import { useTailwindVariant } from 'pxd'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}>()

const { attrs, classes } = useTailwindVariant(
  {
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
  },
  {
    selection: () => ({
      variant: props.variant,
      size: props.size,
    }),
  },
)
</script>

<template>
  <button v-bind="attrs" :class="classes">
    <slot />
  </button>
</template>
```

`classes` and `attrs` are automatically unwrapped in templates. Access their `.value` when using them in script code.

### Compound variants with multiple values

Compound variants support array values to match any of the listed values:

```ts
const { classes } = useTailwindVariant(
  {
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
  },
  {
    selection: () => ({ variant: props.variant, size: props.size }),
  },
)
```

### Nested class objects

Variant values can be objects for conditional class application (powered by `cnfast`):

```ts
const { classes } = useTailwindVariant(
  {
    variants: {
      variant: {
        primary: {
          'bg-blue-500 text-white': true,
          'shadow-lg': false,
        },
      },
    },
  },
  {
    selection: () => ({ variant: props.variant }),
  },
)
```

### Resolving multiple selections

`createTailwindVariant` is a pure function that does not access Vue state or `$attrs`. Use it when one configuration needs to produce classes for multiple elements:

```ts
import { computed } from 'vue'
import { createTailwindVariant } from 'pxd'

const thumbClasses = createTailwindVariant({
  base: 'absolute appearance-none',
  variants: {
    size: {
      sm: 'h-3 w-1.5',
      md: 'h-4 w-2',
    },
    appearance: {
      none: 'appearance-none',
      auto: 'appearance-auto',
    },
  },
})

const classes = computed(() => ({
  start: thumbClasses({ size: props.size, appearance: 'none' }),
  end: thumbClasses({ size: props.size, appearance: 'auto' }),
}))
```

### Disabling attrs class merging

Set `mergeAttrsClass: false` to keep `class` in `attrs` and not merge it into the computed classes:

```ts
const { attrs, classes } = useTailwindVariant(config, {
  selection: () => ({ size: props.size }),
  mergeAttrsClass: false,
})
```
