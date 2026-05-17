# useCountdown

Manages countdown/count-up timers with configurable precision and event emission.

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
  invert?: boolean
  active?: boolean
  startAt?: number
  endTime?: number
  autoReset?: boolean
  durations?: number
  precision?: number
  millisecond?: boolean
  intuitive?: boolean
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `props` | `CountdownOptions` | Countdown configuration options |
| `emits` | `EmitFn<T>` | Event emit function |
