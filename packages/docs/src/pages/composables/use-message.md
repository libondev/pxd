# useMessage

Creates and dispatches toast/message notifications via custom events.

## Exports

```ts
function useMessage(msg: MessageContent, options?: Options): void

function closeMessage(group?: string, id?: string | number): void
function clearMessage(group?: string): void
```

## Types

```ts
type MessageContent = string | VNode

interface Options {
  id?: string | number
  type?: 'info' | 'success' | 'warning' | 'error' | 'loading'
  class?: ComponentClass
  group?: string
  action?: Action
  message?: string | VNode
  promise?: Promise<unknown>
  durations?: number
  closeable?: boolean
  error?: PromiseMessageHandler
  success?: PromiseMessageHandler
  finally?: PromiseMessageHandler
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `msg` | `MessageContent` | The message content |
| `options.id` | `string \| number` | Unique identifier for the message |
| `options.type` | `'info' \| 'success' \| 'warning' \| 'error' \| 'loading'` | Message type |
| `options.group` | `string` | Message group identifier |
| `options.action` | `Action` | Action configuration for the message |
| `options.message` | `string \| VNode` | The message content (alternative to `msg`) |
| `options.promise` | `Promise<unknown>` | Promise that triggers message lifecycle |
| `options.durations` | `number` | Display duration in milliseconds |
| `options.closeable` | `boolean` | Whether the message is closeable |
| `options.error` | `PromiseMessageHandler` | Handler for promise rejection |
| `options.success` | `PromiseMessageHandler` | Handler for promise resolution |
| `options.finally` | `PromiseMessageHandler` | Handler for promise settlement |
