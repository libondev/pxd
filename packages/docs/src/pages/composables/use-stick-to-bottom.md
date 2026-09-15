# useStickToBottom

Keep a scroll container pinned to the bottom while content changes, until the user scrolls away. Returning to the bottom re-enables auto-follow.

Auto-scroll is always **instant**. Smooth scrolling is intentionally unsupported: animation frames re-measure mid-scroll, flip `isAtBottom` off, and break continuous follow in chat-style lists.

## Exports

```ts
function useStickToBottom(
  container: MaybeRefOrGetter<Nullable<HTMLElement>>,
  content?: MaybeRefOrGetter<Nullable<HTMLElement>>,
  options?: UseStickToBottomOptions,
): UseStickToBottomReturn
```

## Types

```ts
interface UseStickToBottomOptions {
  /** Pixel distance from the bottom considered "at bottom". @default 8 */
  threshold?: MaybeRefOrGetter<number>
  /** Whether content updates should auto-scroll while at bottom. @default true */
  enabled?: MaybeRefOrGetter<boolean>
}

interface UseStickToBottomReturn {
  isAtBottom: ShallowRef<boolean>
  scrollToBottom: () => void
  forceStickToBottom: () => void
  stickIfNeeded: () => void
  update: () => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `container` | `MaybeRefOrGetter<Nullable<HTMLElement>>` | The scrollable container element |
| `content` | `MaybeRefOrGetter<Nullable<HTMLElement>>` | Optional content root for ResizeObserver (falls back to `container`) |
| `options.threshold` | `MaybeRefOrGetter<number>` | Distance from bottom considered "at bottom" |
| `options.enabled` | `MaybeRefOrGetter<boolean>` | Whether updates auto-scroll while at bottom |

MutationObserver watches `container` (its subtree covers in-container content). Pass `content` when the measured content root is a distinct child that should drive ResizeObserver.

## Returns

| Name | Type | Description |
| --- | --- | --- |
| `isAtBottom` | `ShallowRef<boolean>` | Whether the container is currently within the bottom threshold |
| `scrollToBottom` | `() => void` | Instantly scroll the container to the bottom (Y axis only) |
| `forceStickToBottom` | `() => void` | Scroll to bottom and re-enable auto-stick |
| `stickIfNeeded` | `() => void` | Scroll to bottom only when currently at bottom and enabled |
| `update` | `() => void` | Re-measure whether the container is at the bottom |

## Usage

```ts
import { useStickToBottom } from 'pxd/composables'

const containerRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()

const { isAtBottom, scrollToBottom, forceStickToBottom, stickIfNeeded, update } =
  useStickToBottom(containerRef, contentRef, {
    threshold: 8,
    enabled: true,
  })
```

The container must have a constrained height (explicit height, flex child with `min-h-0`, etc.). Otherwise it grows with content and never scrolls.
