# useStickToBottom

Keep a scroll container pinned to the bottom while content changes, until the user scrolls away. Returning to the bottom re-enables auto-follow.

Auto-scroll is always **instant**. Smooth scrolling is intentionally unsupported: animation frames re-measure mid-scroll, flip `isAtBottom` off, and break continuous follow in chat-style lists.

Only an upward scroll breaks follow. The composable's own scroll writes and browser adjustments (scroll anchoring, focus scrolling) never clear `isAtBottom`, so content that keeps growing — streaming markdown, images, web fonts — cannot latch the view off the bottom. Set `overflow-anchor: none` on the container when you supply your own element; anchoring compensation otherwise reads as the user scrolling away. `PStickToBottom` applies it for you.

With `pauseOnInteract`, a pointerdown on the content suspends auto-stick until the next scroll or an explicit `scrollToBottom` / `forceStickToBottom` — user-triggered size changes (expanding a panel, selecting text) keep the reading position. `stickIfNeeded` re-measures instead of scrolling while paused. Pointerdowns inside `interactExclude` (e.g. a sticky input bar) never start the pause.

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
  /** Pixel distance from the bottom considered "at bottom". @default 16 */
  threshold?: MaybeRefOrGetter<number>
  /** Whether content updates should auto-scroll while at bottom. @default true */
  enabled?: MaybeRefOrGetter<boolean>
  /** Suspend auto-stick from the next pointerdown on the content until a scroll or explicit stick. @default false */
  pauseOnInteract?: MaybeRefOrGetter<boolean>
  /** Pointerdowns inside this element never start the pause. */
  interactExclude?: MaybeRefOrGetter<Nullable<HTMLElement>>
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
| `options.pauseOnInteract` | `MaybeRefOrGetter<boolean>` | Suspend auto-stick from the next pointerdown on the content until a scroll or explicit stick |
| `options.interactExclude` | `MaybeRefOrGetter<Nullable<HTMLElement>>` | Pointerdowns inside this element never start the pause |

MutationObserver watches `container` (its subtree covers in-container content). Pass `content` when the measured content root is a distinct child that should drive ResizeObserver.

## Returns

| Name | Type | Description |
| --- | --- | --- |
| `isAtBottom` | `ShallowRef<boolean>` | Whether the container is currently within the bottom threshold |
| `scrollToBottom` | `() => void` | Instantly scroll the container to the bottom (Y axis only) |
| `forceStickToBottom` | `() => void` | Scroll to bottom and re-enable auto-stick |
| `stickIfNeeded` | `() => void` | Scroll to bottom only when currently at bottom and enabled; re-measures instead while paused by interaction |
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
