# useMutationObserver

Creates and manages a browser MutationObserver for one or more target elements. The observer is
built once the targets resolve and is released when the owning scope stops.

## Exports

```ts
function useMutationObserver(
  target: TargetRef,
  callback: (items: Array<{ entry: MutationRecord; target: HTMLElement }>) => void,
  options?: MaybeRefOrGetter<MutationObserverInit>,
): ObserverResults<MutationObserver>
```

## Types

```ts
type TargetRef =
  | MaybeRefOrGetter<Nullable<HTMLElement>>
  | MaybeRefOrGetter<Nullable<HTMLElement>>[]
  | MaybeRefOrGetter<Nullable<HTMLElement>[]>

interface ObserverResults<TObserver> {
  observer: Ref<TObserver | undefined>
  stop: () => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `target` | `TargetRef` | The target element(s) to observe. Duplicates are collapsed. |
| `callback` | `(items: Array<{ entry: MutationRecord; target: HTMLElement }>) => void` | Fired with the entries reported since the last callback. Each item carries the registered element it belongs to. |
| `options` | `MaybeRefOrGetter<MutationObserverInit>` | Observer configuration. May be a getter, in which case changing its result rebuilds the observer. |

## Notes

- Instances are **not** shared. A `subtree` observer reports descendants, so each record has to be attributed back to the registered element, which is not worth doing safely across many subscribers.
- An item's `entry` is a `MutationRecord`: its own `target` is the changed node, while the item's `target` is the element that was registered.
- The native `observe` requires at least one of `attributes`, `characterData` or `childList` to be `true`, so `options` has to set one.
- `options` are compared after normalisation, so equivalent values such as `threshold: [0, 1]` and `threshold: [1, 0]` reuse the same observer.
- Changing `target` adds or removes elements without recreating the observer; only an `options` change rebuilds it.
- `stop()` releases the observer immediately. Inside a component that is optional, because scope disposal does the same thing.
