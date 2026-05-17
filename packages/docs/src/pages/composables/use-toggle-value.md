# useToggleValue

Toggles between truthy/falsy values with optional custom values.

## Exports

```ts
function useToggleValue(
  initialValue?: boolean,
  options?: Options,
): {
  value: Ref<boolean>
  toggle: (newValue?: boolean) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `initialValue` | `boolean` | The initial toggle state |
