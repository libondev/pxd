# useScrollspy

Tracks which target element is currently in the viewport during scroll.

Scroll callbacks are collapsed into one animation frame, and the active target is recomputed whenever the
target list, the probe line, or the size of the scroll container changes.

## Exports

```ts
function useScrollspy(
  targets: MaybeRefOrGetter<HTMLElement[]>,
  options?: UseScrollspyOptions,
): UseScrollspyReturn
```

## Types

```ts
interface UseScrollspyOptions {
  scrollTarget?: MaybeRefOrGetter<Window | HTMLElement | null>
  topOffset?: MaybeRefOrGetter<number>
}

interface UseScrollspyReturn {
  activeIndex: ShallowRef<number>
  activeEl: ShallowRef<HTMLElement | null>
  update: () => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `targets` | `MaybeRefOrGetter<HTMLElement[]>` | The list of target elements to track |
| `options.scrollTarget` | `MaybeRefOrGetter<Window \| HTMLElement \| null>` | The scrollable container (defaults to window) |
| `options.topOffset` | `MaybeRefOrGetter<number>` | Probe line measured from the top of the scroll viewport |
