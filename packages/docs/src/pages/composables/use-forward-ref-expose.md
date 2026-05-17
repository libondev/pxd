# useForwardRefExpose

Forwards all property/method access from a proxy to a target ref, enabling transparent ref delegation.

## Exports

```ts
function useForwardRefExpose<T extends object>(
  refEl: MaybeRefOrGetter<T | null | undefined>,
): T
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `refEl` | `MaybeRefOrGetter<T \| null \| undefined>` | The target ref to delegate property/method access to |
