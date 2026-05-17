# useColorScheme

Manages dark/light color scheme with localStorage persistence and multi-instance synchronization.

## Exports

```ts
function useColorScheme(options?: Options): {
  isDark: ComputedRef<boolean>
  colorScheme: Ref<ColorPreference>
  toggleDarkMode: () => void
}
```

## Types

```ts
interface Options {
  syncStatus?: boolean
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `options.syncStatus` | `boolean` | Whether to synchronize scheme status across instances |
