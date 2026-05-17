# useListNavigation

Manages keyboard/pointer navigation through DOM list items with active-index tracking.

## Exports

```ts
function useListNavigation(
  containerRef: MaybeRefOrGetter<HTMLElement | undefined>,
  options: UseListNavigationOptions,
): UseListNavigationReturn
```

## Types

```ts
interface UseListNavigationOptions {
  loop?: MaybeRefOrGetter<boolean>
  itemSelector?: MaybeRefOrGetter<string>
  defaultActiveIndex?: MaybeRefOrGetter<number>
  toggleOnKeyPress?: MaybeRefOrGetter<boolean>
  onToggle?: (index: number) => void
  onEnter?: (el: HTMLElement) => void
}

interface UseListNavigationReturn {
  activeIndex: ShallowRef<number>
  setActiveIndex: (index: number) => void
  registerItem: (el: HTMLElement, indexRef: ShallowRef<number>) => void
  unregisterItem: (el: HTMLElement) => void
  onKeydown: (ev: KeyboardEvent) => void
  onPointerOver: (ev: PointerEvent) => void
  refreshItems: () => Promise<void>
  setFirstAsActive: () => void
  isEmpty: () => boolean
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `containerRef` | `MaybeRefOrGetter<HTMLElement \| undefined>` | The container element holding list items |
| `options.loop` | `MaybeRefOrGetter<boolean>` | Whether navigation loops from last to first and vice versa |
| `options.itemSelector` | `MaybeRefOrGetter<string>` | CSS selector for navigable items |
| `options.defaultActiveIndex` | `MaybeRefOrGetter<number>` | Initial active item index |
| `options.toggleOnKeyPress` | `MaybeRefOrGetter<boolean>` | Whether to toggle on key press |
| `options.onToggle` | `(index: number) => void` | Callback fired when an item is toggled |
| `options.onEnter` | `(el: HTMLElement) => void` | Callback fired when Enter key is pressed on an item |
