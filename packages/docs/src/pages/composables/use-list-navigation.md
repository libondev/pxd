# useListNavigation

Manages pointer navigation and semantic keyboard navigation through DOM list items with active-index tracking.

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
  onToggle?: (index: number) => void
  onActivateItem?: (el: HTMLElement) => void
}

interface UseListNavigationReturn {
  activeIndex: ShallowRef<number>
  setActiveIndex: (index: number) => void
  registerItem: (el: HTMLElement, indexRef: ShallowRef<number>) => void
  unregisterItem: (el: HTMLElement) => void
  dispatch: (command: ListNavigationCommand) => boolean
  onPointerOver: (ev: PointerEvent) => void
  refreshItems: () => Promise<void>
  setFirstAsActive: () => void
  isEmpty: () => boolean
}

type ListNavigationCommand =
  | 'next'
  | 'previous'
  | 'first'
  | 'last'
  | 'activate'
  | 'enter-child'
  | 'leave-parent'
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `containerRef` | `MaybeRefOrGetter<HTMLElement \| undefined>` | The container element holding list items |
| `options.loop` | `MaybeRefOrGetter<boolean>` | Whether navigation loops from last to first and vice versa |
| `options.itemSelector` | `MaybeRefOrGetter<string>` | CSS selector for navigable items |
| `options.defaultActiveIndex` | `MaybeRefOrGetter<number>` | Initial active item index |
| `options.onToggle` | `(index: number) => void` | Callback fired when an item is toggled |
| `options.onActivateItem` | `(el: HTMLElement) => void` | Callback fired when the active item is activated |

`dispatch(command)` returns `true` when the command was handled. It does not receive or mutate a
`KeyboardEvent`; key mapping and browser event consumption belong to the component that owns focus.
