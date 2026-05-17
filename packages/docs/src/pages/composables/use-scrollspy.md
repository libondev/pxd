# useScrollspy

Tracks which target element is currently in the viewport during scroll.

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
  topOffset?: number
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
| `options.topOffset` | `number` | Top offset in pixels for intersection calculation |
