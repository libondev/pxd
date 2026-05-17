# useModelValue

Creates a writable computed ref for v-model binding with custom get/set handlers.

## Exports

```ts
function useModelValue<P extends BaseProps, E extends BaseEmits>(
  props: P,
  emits: E,
  options?: ModelValueOptions,
): WritableComputedRef<P['modelValue']>
```

## Types

```ts
interface BaseProps {
  modelValue?: any
}

interface BaseEmits {
  (event: 'change', ...args: any[]): void
  (event: 'update:modelValue', ...args: any[]): void
}

interface ModelValueOptions {
  get?: (value: any) => any
  set?: (value: any) => void
  withChange?: boolean
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `props` | `BaseProps` | Component props containing `modelValue` |
| `emits` | `BaseEmits` | Component emits function |
| `options.get` | `(value: any) => any` | Custom getter transform |
| `options.set` | `(value: any) => void` | Custom setter transform |
| `options.withChange` | `boolean` | Whether to emit `change` event alongside `update:modelValue` |
