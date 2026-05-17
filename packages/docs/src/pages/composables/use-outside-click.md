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
  isEnabled?: (ev: PointerEvent) => boolean
  onTrigger?: (ev: PointerEvent) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `container` | `MaybeElementRef<HTMLElement>` | The container element to detect outside clicks for |
| `options.allowList` | `MaybeElementRef<HTMLElement>[]` | Elements excluded from outside click detection |
| `options.isEnabled` | `(ev: PointerEvent) => boolean` | Whether the outside click detection is enabled |
| `options.onTrigger` | `(ev: PointerEvent) => void` | Callback fired when an outside click is detected |
