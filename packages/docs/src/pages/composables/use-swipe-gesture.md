# useSwipeGesture

Detects swipe gestures with velocity/distance thresholds and fires callbacks on press/follow/release.

## Exports

```ts
function useSwipeGesture(
  containerRef: MaybeElementRef<HTMLElement>,
  options?: SwipeGestureOptions,
): {
  stop: () => void
}
```

## Types

```ts
interface SwipeGestureOptions {
  disabled?: MaybeRefOrGetter<boolean>
  handleSelector?: string
  direction?: MaybeRefOrGetter<'horizontal' | 'vertical'>
  swipeThreshold?: number
  distanceThreshold?: number
  velocityThreshold?: number
  onPress?: (state: SwipePressState) => void
  onFollow?: (state: SwipeFollowState) => void
  onRelease?: (state: SwipeReleaseState) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `containerRef` | `MaybeElementRef<HTMLElement>` | The container element to detect swipe gestures on |
| `options.disabled` | `MaybeRefOrGetter<boolean>` | Whether swipe detection is disabled |
| `options.handleSelector` | `string` | CSS selector for the swipe handle element |
| `options.direction` | `MaybeRefOrGetter<'horizontal' \| 'vertical'>` | Swipe direction to detect |
| `options.swipeThreshold` | `number` | Threshold for swipe activation |
| `options.distanceThreshold` | `number` | Minimum distance in pixels to qualify as a swipe |
| `options.velocityThreshold` | `number` | Minimum velocity to qualify as a swipe |
| `options.onPress` | `(state: SwipePressState) => void` | Callback fired on pointer press |
| `options.onFollow` | `(state: SwipeFollowState) => void` | Callback fired on pointer move |
| `options.onRelease` | `(state: SwipeReleaseState) => void` | Callback fired on pointer release |
