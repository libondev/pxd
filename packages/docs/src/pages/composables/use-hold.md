# useHold

Tracks a press-and-hold gesture: progress, confirmation and cancellation.

## Exports

```ts
function useHold(options?: HoldOptions): {
  status: Readonly<Ref<HoldStatus>>
  progress: Readonly<Ref<number>>
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
}
```

## Types

```ts
type HoldStatus = 'idle' | 'loading' | 'confirmed' | 'canceled'

interface HoldOptions {
  duration?: MaybeRefOrGetter<number | undefined>
  enabled?: MaybeRefOrGetter<boolean | undefined>
  onConfirm?: () => void
  onCancel?: (progress: number) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `options.duration` | `MaybeRefOrGetter<number \| undefined>` | Hold duration in milliseconds; defaults to `2000` |
| `options.enabled` | `MaybeRefOrGetter<boolean \| undefined>` | Whether `start` can begin a hold; defaults to `true` |
| `options.onConfirm` | `() => void` | Called once the hold reaches the duration |
| `options.onCancel` | `(progress: number) => void` | Called when the hold ends before it reaches the duration |
