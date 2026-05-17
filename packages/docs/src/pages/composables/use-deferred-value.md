# useDeferredValue

Defers value updates by a configurable delay, useful for debouncing reactive changes.

## Exports

```ts
function useDeferredValue<T>(
  defaultValue: MaybeRefOrGetter<T>,
  options?: Options<T>,
): {
  value: Ref<T>
  deferred: Ref<T>
}
```

## Types

```ts
interface Options<T> {
  delay?: number
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `defaultValue` | `MaybeRefOrGetter<T>` | The initial value |
| `options.delay` | `number` | Delay in milliseconds before updating the deferred value |
