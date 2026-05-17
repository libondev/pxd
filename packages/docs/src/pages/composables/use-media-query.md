# useMediaQuery

Tracks media query matches with caching and reactive updates.

## Exports

```ts
function useMediaQuery(
  condition: string,
  callback?: (e: MediaQueryList) => void,
): Ref<boolean>
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `condition` | `string` | The media query string to evaluate |
| `callback` | `(e: MediaQueryList) => void` | Callback fired when the media query match state changes |
