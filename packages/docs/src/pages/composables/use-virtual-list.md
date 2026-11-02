# useVirtualList

Manages virtualized rendering of large lists with scroll-to support.

## Exports

```ts
function useVirtualList<Options extends VirtualListOptions>(
  containerRef: MaybeElementRef<HTMLElement>,
  options: Options,
): {
  virtualItems: ComputedRef<VirtualListItem[]>
  totalSize: ComputedRef<number>
  measureElement: (el: Element | ComponentPublicInstance | null) => void
  scrollToIndex: (index: number, opts?: ScrollToIndexOpts) => number
  scrollToOffset: (offset: number, opts?: ScrollToOffsetOpts) => number
  scrollBy: (delta: number, opts?: ScrollToOffsetOpts) => number
  getVirtualizer: () => Virtualizer
}
```

## Types

```ts
interface VirtualListItem extends VirtualItem {
  key: string | number
}

interface VirtualListOptions {
  status?: 'loading' | 'finished' | 'error' | ''
  dataKey?: string
  items?: any[]
  itemSize?: number | ((index: number) => number)
  overScan?: number
  columnGap?: number
  columnCount?: number
  scrollPaddingStart?: number
  scrollPaddingEnd?: number
  onBottom?: () => void | Promise<void>
  bottomThreshold?: number
  onGeometryChange?: () => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `containerRef` | `MaybeElementRef<HTMLElement>` | The scrollable container element |
| `options.status` | `'loading' \| 'finished' \| 'error' \| ''` | Current list status |
| `options.dataKey` | `string` | Key field name for item identification |
| `options.items` | `any[]` | The full list data array |
| `options.itemSize` | `number \| ((index: number) => number)` | Height of an unmeasured row, or a per-index guess |
| `options.overScan` | `number` | Number of extra items to render outside viewport |
| `options.columnGap` | `number` | Gap between columns in pixels |
| `options.columnCount` | `number` | Number of columns for grid layout |
| `options.scrollPaddingStart` | `number` | Pixels kept free at the start edge when scrolling an item into view |
| `options.scrollPaddingEnd` | `number` | Pixels kept free at the end edge when scrolling an item into view |
| `options.onBottom` | `() => void \| Promise<void>` | Callback fired when scrolled to bottom |
| `options.bottomThreshold` | `number` | Threshold in pixels for triggering `onBottom` |
| `options.onGeometryChange` | `() => void` | Called once the content's size is final for the frame, before it paints |

`onGeometryChange` is the seam for anything that keeps the view pinned to the bottom: the list grows
by rewriting its content height, which no observer can attribute to a node, and the resize delivery
that follows lands after the paint it should have corrected. Subscribing also measures mounted rows
before that paint, so the callback reads a final height.
