# useListKeyboardController

Maps keyboard events from an input or container to semantic list navigation commands.
The source component owns the keymap, so text editing and IME composition remain handled by the
source element.

## Exports

```ts
function useListKeyboardController(
	options: UseListKeyboardControllerOptions,
): UseListKeyboardControllerReturn
```

## Types

```ts
type ListKeyboardMap = Readonly<Record<string, ListNavigationCommand>>

interface UseListKeyboardControllerOptions {
	keymap: MaybeRefOrGetter<ListKeyboardMap>
	onCommand: (command: ListNavigationCommand, ev: KeyboardEvent) => boolean
	preventDefaultKeys?: MaybeRefOrGetter<readonly string[]>
	enabled?: MaybeRefOrGetter<boolean>
}

interface UseListKeyboardControllerReturn {
	onKeydown: (ev: KeyboardEvent) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `options.keymap` | `MaybeRefOrGetter<ListKeyboardMap>` | Maps source keys to list navigation commands |
| `options.onCommand` | `(command, event) => boolean` | Decides whether and how the source component applies a command, typically by calling `listRef.dispatch(command)` |
| `options.preventDefaultKeys` | `MaybeRefOrGetter<readonly string[]>` | Keys whose default browser action should be prevented without dispatching a command |
| `options.enabled` | `MaybeRefOrGetter<boolean>` | Whether keyboard events should be delegated |

## Behavior

- Events are ignored when `enabled` resolves to `false`.
- Events from IME composition are ignored.
- Keys not included in `options.keymap` are left untouched.
- Keys in `options.preventDefaultKeys` only prevent their browser default action; they do not dispatch a list command.
- When `options.preventDefaultKeys` is omitted, `PageUp` and `PageDown` are prevented by default.
- Commands are consumed only when `options.onCommand` reports that the command was handled.

Use this composable when the list is controlled by another focus owner, such as a search input in a command menu or select component. Keep the input focused and delegate only list navigation keys.
