# useDelayChange

Updates a value with optional delay, supporting immediate or deferred changes.

## Exports

```ts
function useDelayChange<T>(
  value: MaybeRefOrGetter<T>,
  options?: Options<T>,
): {
  value: Ref<T>
  setValue: (value: T, immediate?: boolean) => void
}
```

## Types

```ts
interface Options<T> {
  delay?: number
  valueChange?: (v: T) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `value` | `MaybeRefOrGetter<T>` | The source value to watch |
| `options.delay` | `number` | Delay in milliseconds before applying the change |
| `options.valueChange` | `(v: T) => void` | Callback fired when the value changes |
