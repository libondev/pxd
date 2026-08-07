# useListKeyboardController

Routes keyboard navigation events from an input or container to a list navigation target.
Only configured keys are delegated, so text editing and IME composition remain handled by the
source element.

## Exports

```ts
function useListKeyboardController(
	options: UseListKeyboardControllerOptions,
): UseListKeyboardControllerReturn
```

## Types

```ts
interface ListKeyboardTarget {
	onKeydown: (ev: KeyboardEvent) => void
}

interface UseListKeyboardControllerOptions {
	list: MaybeRefOrGetter<ListKeyboardTarget | undefined>
	enabled?: MaybeRefOrGetter<boolean>
	keys?: MaybeRefOrGetter<readonly string[]>
}

interface UseListKeyboardControllerReturn {
	onKeydown: (ev: KeyboardEvent) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `options.list` | `MaybeRefOrGetter<ListKeyboardTarget \| undefined>` | The list navigation target |
| `options.enabled` | `MaybeRefOrGetter<boolean>` | Whether keyboard events should be delegated |
| `options.keys` | `MaybeRefOrGetter<readonly string[]>` | Keyboard keys to delegate; defaults to `ArrowDown`, `ArrowUp`, `Enter`, `PageDown`, and `PageUp` |

## Behavior

- Events are ignored when `enabled` resolves to `false`.
- Events from IME composition are ignored.
- Keys not included in `options.keys` are left untouched.
- The target list receives the original `KeyboardEvent`, allowing it to control `preventDefault()` and propagation.

Use this composable when the list is controlled by another focus owner, such as a search input in a command menu or select component. Keep the input focused and delegate only list navigation keys.
