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
  listData?: any[]
  itemSize?: number
  overScan?: number
  columnGap?: number
  columnCount?: number
  onBottom?: () => void | Promise<void>
  bottomThreshold?: number
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `containerRef` | `MaybeElementRef<HTMLElement>` | The scrollable container element |
| `options.status` | `'loading' \| 'finished' \| 'error' \| ''` | Current list status |
| `options.dataKey` | `string` | Key field name for item identification |
| `options.listData` | `any[]` | The full list data array |
| `options.itemSize` | `number` | Default item size in pixels |
| `options.overScan` | `number` | Number of extra items to render outside viewport |
| `options.columnGap` | `number` | Gap between columns in pixels |
| `options.columnCount` | `number` | Number of columns for grid layout |
| `options.onBottom` | `() => void \| Promise<void>` | Callback fired when scrolled to bottom |
| `options.bottomThreshold` | `number` | Threshold in pixels for triggering `onBottom` |
