# useDelayDestroy

Manages two-phase visibility transitions (render + visible) with configurable delay on unmount.

## Exports

```ts
function useDelayDestroy(
  value: MaybeRefOrGetter<Nullable<boolean>>,
  options?: Options,
): {
  render: Ref<boolean>
  visible: Ref<boolean>
  show: () => Promise<boolean>
  hide: () => Promise<boolean>
}
```

## Types

```ts
interface Options {
  delay?: number
  renderChange?: (v: boolean) => void
  visibleChange?: (v: boolean) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `value` | `MaybeRefOrGetter<Nullable<boolean>>` | The visibility control value |
| `options.delay` | `number` | Delay in milliseconds before destroying |
| `options.renderChange` | `(v: boolean) => void` | Callback fired when render state changes |
| `options.visibleChange` | `(v: boolean) => void` | Callback fired when visible state changes |
