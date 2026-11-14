# useCarousel

Drives a carousel's index, looping and autoplay state without rendering anything.

## Exports

```ts
function useCarousel(options?: CarouselOptions): {
  index: Readonly<Ref<number>>
  isAtFirst: ComputedRef<boolean>
  isAtLast: ComputedRef<boolean>
  isAutoPlayPaused: Readonly<Ref<boolean>>
  progressKey: Readonly<Ref<number>>
  next: () => Promise<number | null>
  prev: () => Promise<number | null>
  goTo: (index: number) => Promise<number | null>
  pause: () => void
  resume: () => void
  stop: () => void
}
```

## Types

```ts
interface CarouselMove {
  from: number
  to: number
  direction: 1 | -1
  wrapped: boolean
}

interface CarouselOptions {
  count?: MaybeRefOrGetter<number>
  defaultIndex?: number
  loop?: MaybeRefOrGetter<boolean>
  autoplay?: MaybeRefOrGetter<boolean>
  interval?: MaybeRefOrGetter<number>
  transition?: (move: CarouselMove) => void | Promise<void>
  onChange?: (index: number) => void
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `options.count` | `MaybeRefOrGetter<number>` | Number of slides |
| `options.defaultIndex` | `number` | Index used on the first render; later values are ignored, call `goTo` instead |
| `options.loop` | `MaybeRefOrGetter<boolean>` | Wrap around at both ends; defaults to `true` |
| `options.autoplay` | `MaybeRefOrGetter<boolean>` | Advance on an interval; defaults to `false` |
| `options.interval` | `MaybeRefOrGetter<number>` | Autoplay interval in milliseconds; defaults to `3000` |
| `options.transition` | `(move: CarouselMove) => void \| Promise<void>` | Runs before the index is committed; resolve it when the visual transition ends |
| `options.onChange` | `(index: number) => void` | Called after the index is committed |
