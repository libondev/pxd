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
  axis?: MaybeRefOrGetter<'horizontal' | 'vertical'>
  axisLockThreshold?: number
  axisLockRatio?: number
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
| `options.axis` | `MaybeRefOrGetter<'horizontal' \| 'vertical'>` | Swipe axis to detect |
| `options.axisLockThreshold` | `number` | Minimum movement before locking the gesture axis |
| `options.axisLockRatio` | `number` | Main-axis movement ratio required to accept the gesture |
| `options.swipeThreshold` | `number` | Threshold for swipe activation |
| `options.distanceThreshold` | `number` | Minimum sliding size ratio |
| `options.velocityThreshold` | `number` | Minimum velocity to qualify as a swipe |
| `options.onPress` | `(state: SwipePressState) => void` | Callback fired on pointer press |
| `options.onFollow` | `(state: SwipeFollowState) => void` | Callback fired on pointer move |
| `options.onRelease` | `(state: SwipeReleaseState) => void` | Callback fired on pointer release |
