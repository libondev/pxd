# useFocusTrap

Traps keyboard focus within a container, coordinating nested traps for modals/dialogs.

## Exports

```ts
function useFocusTrap(
  container: MaybeElementRef<HTMLElement>,
  userOptions?: MaybeRefOrGetter<UseFocusTrapOptions>,
): {
  stop: () => void
}
```

## Types

```ts
interface UseFocusTrapOptions extends FocusTrapOptions {
  autoFocusElement?: string | boolean
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `container` | `MaybeElementRef<HTMLElement>` | The container element to trap focus within |
| `userOptions` | `MaybeRefOrGetter<UseFocusTrapOptions>` | Focus trap configuration |
| `userOptions.autoFocusElement` | `string \| boolean` | Element to auto-focus when trap activates |
