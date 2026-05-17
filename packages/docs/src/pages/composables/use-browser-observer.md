# useBrowserObserver

Creates and manages browser observer instances (Intersection, Mutation, Resize) for target elements.

## Exports

```ts
function useIntersectionObserver(
  target: TargetRef,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): ObserverResults<IntersectionObserver>

function useMutationObserver(
  target: TargetRef,
  callback: MutationCallback,
  options?: MutationObserverInit,
): ObserverResults<MutationObserver>

function useResizeObserver(
  target: TargetRef,
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions,
): ObserverResults<ResizeObserver>
```

## Types

```ts
type TargetRef =
  | MaybeRefOrGetter<Nullable<HTMLElement>>
  | MaybeRefOrGetter<Nullable<HTMLElement>>[]
  | MaybeRefOrGetter<Nullable<HTMLElement>[]>

interface ObserverResults<T extends Observers> {
  observer: Ref<T | undefined>
  stop: () => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `target` | `TargetRef` | The target element(s) to observe |
| `callback` | `IntersectionObserverCallback` / `MutationCallback` / `ResizeObserverCallback` | Callback fired when the observer detects changes |
| `options` | `IntersectionObserverInit` / `MutationObserverInit` / `ResizeObserverOptions` | Observer-specific configuration options |
