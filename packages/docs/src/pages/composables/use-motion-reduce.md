# useMotionReduced

Tracks whether reduced motion is active, either through the `prefers-reduced-motion` system preference or a `--duration: 0` opt-out on `:root`.

## Exports

```ts
function useMotionReduced(): Readonly<Ref<boolean>>
```
