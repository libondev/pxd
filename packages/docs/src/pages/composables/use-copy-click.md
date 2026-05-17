# useCopyClick

Provides clipboard text copying with copy-state tracking and visual feedback.

## Exports

```ts
function useCopyClick(): {
  isCopied: Ref<boolean>
  copyText: (text?: string) => Promise<void>
}
```
