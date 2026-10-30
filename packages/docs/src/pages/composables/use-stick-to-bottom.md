# useStickToBottom

Keep a scroll container pinned to the bottom while content changes, until the user scrolls away. Returning to the bottom re-enables auto-follow.

Auto-scroll is always **instant**. Smooth scrolling is intentionally unsupported: animation frames re-measure mid-scroll, flip `isAtBottom` off, and break continuous follow in chat-style lists.

Only an upward move that the layout does not explain, and that lands off the bottom, breaks follow — decided one frame after the move, once the height it was compensating for has landed. The composable's own writes, browser adjustments (scroll anchoring, focus scrolling, clamping after a shrink), a virtualizer re-measuring its items and a mount-time measurement never clear it, so content that keeps growing — streaming markdown, images, web fonts — cannot latch the view off the bottom, and a container mounted over content already taller than the viewport starts at the bottom. While following, the bottom is re-asserted frame by frame until the geometry stops moving: a measurement pass can land after the write with no box or node change left to observe. Set `overflow-anchor: none` on the container when you supply your own element; anchoring compensation otherwise reads as the user scrolling away. `PStickToBottom` applies it for you.

A resize that follows a pointerdown is never stuck for: a panel the user expands owns the viewport for a fixed quiet window after the pointerdown, so a collapse animation cannot drag the view either. When that resize leaves the view off the bottom, follow ends like a scroll away would — coming back to the bottom resumes it. Pointerdowns inside `action` (e.g. a sticky action bar) do not count as interacting with the content.

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
  threshold?: MaybeRefOrGetter<number>
  enabled?: MaybeRefOrGetter<boolean>
  /** Sticky bar inside the container: pointerdowns there do not count, and hiding it moves the scroll range without resizing a box. */
  action?: MaybeRefOrGetter<Nullable<HTMLElement>>
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
| `options.action` | `MaybeRefOrGetter<Nullable<HTMLElement>>` | Sticky bar inside the container: pointerdowns there do not count as interacting, and its style/class toggles drive the follow check |

ResizeObserver watches `content` and `container`. MutationObserver watches `content` for child and text changes; `action` is observed separately for style/class toggles, because hiding it changes the scroll range without resizing any box.

## Returns

| Name | Type | Description |
| --- | --- | --- |
| `isAtBottom` | `ShallowRef<boolean>` | Whether the container is currently within the bottom threshold |
| `scrollToBottom` | `() => void` | Instantly scroll the container to the bottom (Y axis only) |
| `forceStickToBottom` | `() => void` | Scroll to bottom and re-enable auto-stick |
| `stickIfNeeded` | `() => void` | Scroll to bottom only while following and enabled, and not while a resize the user caused is still moving |
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
