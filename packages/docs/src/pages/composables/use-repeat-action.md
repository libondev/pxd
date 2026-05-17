# useRepeatAction

Repeats an action while pointer is pressed, with acceleration from initial interval to final interval.

## Exports

```ts
function useRepeatAction(action: Callback): Results
function useRepeatAction(options: Options): Results
```

## Types

```ts
interface Options {
  action: Callback
  disabled?: MaybeRefOrGetter<boolean>
  finalInterval?: number
  initialInterval?: number
  accelerationDuration?: number
}

interface Results {
  start: Callback
  stop: Callback
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `action` | `Callback` | The action to repeat |
| `options.action` | `Callback` | The action to repeat |
| `options.disabled` | `MaybeRefOrGetter<boolean>` | Whether the repeat action is disabled |
| `options.finalInterval` | `number` | The final repeat interval in milliseconds |
| `options.initialInterval` | `number` | The initial repeat interval in milliseconds |
| `options.accelerationDuration` | `number` | Duration in milliseconds to accelerate from initial to final interval |
