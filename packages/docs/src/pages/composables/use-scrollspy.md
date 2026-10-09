# useScrollspy

Tracks which target element is currently in the viewport during scroll.

Scroll callbacks are collapsed into one animation frame, and the active target is recomputed whenever the
target list, the probe line, the size of the scroll container, or the viewport changes.

`targets` must be in document order: the probe line is located by bisecting their offsets, so a pass costs
`log n` layout reads instead of one per target.

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
| `targets` | `MaybeRefOrGetter<HTMLElement[]>` | The list of target elements to track, in document order |
| `options.scrollTarget` | `MaybeRefOrGetter<Window \| HTMLElement \| null>` | The scrollable container (defaults to window) |
| `options.topOffset` | `MaybeRefOrGetter<number>` | Probe line measured from the top of the scroll viewport |
