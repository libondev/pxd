# useCountdown

Manages countdown/count-up timers and their event emission.

## Exports

```ts
function useCountdown<T extends Record<string, any>>(
  props: CountdownOptions,
  emits: EmitFn<T>,
): {
  stop: () => void
  reset: () => void
  timestamp: Ref<number>
}
```

## Types

```ts
interface CountdownOptions {
  inverted?: boolean
  enabled?: boolean
  startAt?: number
  endTime?: number
  autoReset?: boolean
  duration?: number
  millisecond?: boolean
  intuitive?: boolean
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `props` | `CountdownOptions` | Countdown configuration options |
| `emits` | `EmitFn<T>` | Event emit function |
