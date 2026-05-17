# useListFilter

Filters list items by keyword with fuzzy matching and tracks visible groups/items.

## Exports

```ts
function useListFilter(options: UseListFilterOptions): UseListFilterReturn
```

## Types

```ts
interface UseListFilterOptions {
  keyword: Ref<string>
  filter?: ListFilterFn
}

interface UseListFilterReturn extends ListFilterContext {
  visibleCount: ComputedRef<number>
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `options.keyword` | `Ref<string>` | The search keyword |
| `options.filter` | `ListFilterFn` | Custom filter function |
