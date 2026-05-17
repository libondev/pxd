# useOverlayManager

Manages overlay/dialog stacks with scroll locking and Escape key coordination.

## Exports

```ts
function useOverlayManager(options: OverlayManagerOptions): {
  isTopOverlay: (entry?: OverlayManagerEntry) => boolean
  registerOverlay: () => void
  unregisterOverlay: () => void
}
```

## Types

```ts
interface OverlayManagerOptions {
  enabled?: MaybeRefOrGetter<boolean>
  lockScrollOnVisible?: MaybeRefOrGetter<boolean>
  lockScroll: () => void
  unlockScroll: () => void
  onPressEscape?: (ev: KeyboardEvent) => void
}

interface OverlayManagerEntry {
  id: symbol
  onPressEscape: OverlayManagerOptions['onPressEscape']
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `options.enabled` | `MaybeRefOrGetter<boolean>` | Whether the overlay manager is enabled |
| `options.lockScrollOnVisible` | `MaybeRefOrGetter<boolean>` | Whether to lock scroll when overlay is visible |
| `options.lockScroll` | `() => void` | Function to lock page scroll |
| `options.unlockScroll` | `() => void` | Function to unlock page scroll |
| `options.onPressEscape` | `(ev: KeyboardEvent) => void` | Callback fired when Escape key is pressed |
