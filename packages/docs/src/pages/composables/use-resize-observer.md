# useResizeObserver

Creates and manages a browser ResizeObserver for one or more target elements. The observer is
built once the targets resolve and is released when the owning scope stops.

## Exports

```ts
function useResizeObserver(
  target: TargetRef,
  callback: (items: Array<{ entry: ResizeObserverEntry; target: HTMLElement }>) => void,
  options?: MaybeRefOrGetter<ResizeObserverOptions>,
): ObserverResults<ResizeObserver>
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
| `callback` | `(items: Array<{ entry: ResizeObserverEntry; target: HTMLElement }>) => void` | Fired with the entries reported since the last callback. Each item carries the registered element it belongs to. |
| `options` | `MaybeRefOrGetter<ResizeObserverOptions>` | Observer configuration. May be a getter, in which case changing its result rebuilds the observer. |

## Notes

- Calls made with equal options share one native observer, and the shared instance is dropped once its last subscriber stops.
- `options` are compared after normalisation, so equivalent values such as `threshold: [0, 1]` and `threshold: [1, 0]` reuse the same observer.
- Changing `target` adds or removes elements without recreating the observer; only an `options` change rebuilds it.
- `stop()` releases the observer immediately. Inside a component that is optional, because scope disposal does the same thing.
