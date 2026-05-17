# useLockScroll

Prevents page scrolling by locking touchmove events and managing scrollbar visibility.

## Exports

```ts
function useLockScroll(): {
  isLocked: () => boolean
  lockScroll: () => void
  unlockScroll: () => void
}
```
