# useCountdown

Manages countdown/count-up timers and reports lifecycle events through callbacks.

## Exports

```ts
function useCountdown(options?: CountdownOptions): {
  stop: () => void
  reset: () => void
  timestamp: Ref<number>
}
```

## Types

```ts
interface CountdownOptions {
  countUp?: MaybeRefOrGetter<boolean>
  enabled?: MaybeRefOrGetter<boolean>
  startAt?: MaybeRefOrGetter<number>
  endTime?: MaybeRefOrGetter<number>
  autoReset?: MaybeRefOrGetter<boolean>
  duration?: MaybeRefOrGetter<number>
  intuitive?: MaybeRefOrGetter<boolean>
  onFinish?: () => void
  onReset?: () => void
  onChange?: (enabled: boolean) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `options.countUp` | `MaybeRefOrGetter<boolean>` | Count up instead of down |
| `options.enabled` | `MaybeRefOrGetter<boolean>` | Start the timer; switching it off pauses, switching it back on resumes |
| `options.startAt` | `MaybeRefOrGetter<number>` | Time already elapsed in milliseconds when the timer starts; in count-up mode the starting value |
| `options.endTime` | `MaybeRefOrGetter<number>` | Absolute end timestamp in milliseconds; takes precedence over `duration` |
| `options.duration` | `MaybeRefOrGetter<number>` | Timer length in milliseconds; in count-up mode `0` counts up indefinitely |
| `options.autoReset` | `MaybeRefOrGetter<boolean>` | Restart from the initial time when `enabled` turns on after finish |
| `options.intuitive` | `MaybeRefOrGetter<boolean>` | Round the remaining time up to whole seconds |
| `options.onFinish` | `() => void` | Called when the countdown reaches its end |
| `options.onReset` | `() => void` | Called when the countdown is restarted from its initial time |
| `options.onChange` | `(enabled: boolean) => void` | Called when the running state changes |