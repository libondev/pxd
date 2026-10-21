# useOutsideClick

Detects clicks outside a container with allowlist support and optional enable/disable logic.

## Exports

```ts
function useOutsideClick(
  container: MaybeElementRef<HTMLElement>,
  options?: Options,
): {
  stop: () => void
}
```

## Types

```ts
interface Options {
  allowList?: MaybeElementRef<HTMLElement>[]
  enabled?: MaybeRefOrGetter<boolean>
  onTrigger?: (ev: PointerEvent) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `container` | `MaybeElementRef<HTMLElement>` | The container element to detect outside clicks for |
| `options.allowList` | `MaybeElementRef<HTMLElement>[]` | Elements excluded from outside click detection |
| `options.enabled` | `MaybeRefOrGetter<boolean>` | Binds the document listener only while it resolves to `true` |
| `options.onTrigger` | `(ev: PointerEvent) => void` | Callback fired when an outside click is detected |
