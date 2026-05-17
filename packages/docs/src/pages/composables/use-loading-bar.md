# useLoadingBar

Dispatches loading bar state changes (start/finish/error/increase) via custom events.

## Exports

```ts
function useLoadingBar(options: Options): void

function start(group?: string): void
function error(group?: string): void
function finish(group?: string): void
function increase(group?: string, value?: number): void
```

## Types

```ts
interface Options {
  type: LoadingBarActionType
  group: string
  value?: number
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `options.type` | `LoadingBarActionType` | The action type for the loading bar event |
| `options.group` | `string` | The group identifier |
| `options.value` | `number` | The value for increase action |
