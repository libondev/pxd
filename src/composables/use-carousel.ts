import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, onScopeDispose, shallowRef, toValue, watch } from 'vue'
import { clampValue } from '../utils/format.js'
import { isServer } from '../utils/is.js'

const DEFAULT_INTERVAL = 3000

export interface CarouselMove {
  /** Logical index before the move. */
  from: number
  /** Logical index after the move. */
  to: number
  direction: 1 | -1
  /** Whether the move crossed the boundary of a looping carousel. */
  wrapped: boolean
}

export interface CarouselOptions {
  /** Number of slides. */
  count?: MaybeRefOrGetter<number>
  /** Index used on the first render. Later values are ignored; call `goTo` instead. */
  defaultIndex?: number
  /** @default true */
  loop?: MaybeRefOrGetter<boolean>
  /** @default false */
  autoplay?: MaybeRefOrGetter<boolean>
  /** @default 3000 */
  interval?: MaybeRefOrGetter<number>
  /**
   * Runs before the index is committed. Resolve it when the visual transition ends;
   * the composable owns the state machine, the caller owns the animation.
   */
  transition?: (move: CarouselMove) => void | Promise<void>
  /** Called after the index is committed. */
  onChange?: (index: number) => void
}

interface Results {
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

export function useCarousel(options: CarouselOptions = {}): Results {
  const indexRef = shallowRef(0)
  const pausedRef = shallowRef(false)
  const progressRef = shallowRef(0)

  let timer: ReturnType<typeof setTimeout> | null = null
  let queue: Promise<unknown> = Promise.resolve()
  let stopped = false

  const readCount = () => Math.max(0, Math.floor(toValue(options.count) ?? 0))
  const isLoop = () => toValue(options.loop) ?? true

  const index = computed(() => indexRef.value)
  const isAtFirst = computed(() => indexRef.value === 0)
  const isAtLast = computed(() => indexRef.value === readCount() - 1)

  function setIndex(value: number): void {
    indexRef.value = value
    options.onChange?.(value)
    restartAutoPlay()
  }

  function normalizeInitial(value: number): number {
    const count = readCount()

    if (count === 0) {
      return 0
    }

    if (isLoop()) {
      return ((value % count) + count) % count
    }

    return clampValue(value, 0, count - 1)
  }

  function enqueue(task: () => Promise<number | null>): Promise<number | null> {
    const result = queue.then(task, task)

    queue = result.then(
      () => null,
      () => null,
    )

    return result
  }

  async function step(direction: 1 | -1): Promise<number | null> {
    const count = readCount()

    if (count <= 1) {
      return null
    }

    const from = indexRef.value
    let to = from + direction
    let wrapped = false

    if (isLoop()) {
      if (to >= count) {
        to = 0
        wrapped = true
      } else if (to < 0) {
        to = count - 1
        wrapped = true
      }
    } else {
      to = clampValue(to, 0, count - 1)

      if (to === from) {
        return null
      }
    }

    await options.transition?.({ from, to, direction, wrapped })
    setIndex(to)

    return to
  }

  function next(): Promise<number | null> {
    return enqueue(() => step(1))
  }

  function prev(): Promise<number | null> {
    return enqueue(() => step(-1))
  }

  function goTo(target: number): Promise<number | null> {
    return enqueue(async () => {
      const count = readCount()

      if (count === 0) {
        return null
      }

      const from = indexRef.value
      const to = isLoop()
        ? ((Math.floor(target) % count) + count) % count
        : clampValue(Math.floor(target), 0, count - 1)

      if (to === from) {
        return from
      }

      await options.transition?.({
        from,
        to,
        direction: to > from ? 1 : -1,
        wrapped: false,
      })
      setIndex(to)

      return to
    })
  }

  function clearTimer(): void {
    if (timer != null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function restartAutoPlay(): void {
    clearTimer()

    if (stopped || isServer() || pausedRef.value || !(toValue(options.autoplay) ?? false)) {
      return
    }

    progressRef.value++
    timer = setTimeout(
      () => {
        timer = null
        void next().finally(() => {
          if (timer === null) {
            restartAutoPlay()
          }
        })
      },
      Math.max(0, toValue(options.interval) ?? DEFAULT_INTERVAL),
    )
  }

  function pause(): void {
    pausedRef.value = true
    clearTimer()
  }

  function resume(): void {
    pausedRef.value = false
    restartAutoPlay()
  }

  function stop(): void {
    stopped = true
    clearTimer()
  }

  watch(readCount, (count) => {
    indexRef.value = count === 0 ? 0 : clampValue(indexRef.value, 0, count - 1)
  })

  watch([() => toValue(options.autoplay), () => toValue(options.interval)], restartAutoPlay)

  onScopeDispose(stop)

  indexRef.value = normalizeInitial(Math.floor(options.defaultIndex ?? 0))
  restartAutoPlay()

  return {
    index,
    isAtFirst,
    isAtLast,
    isAutoPlayPaused: pausedRef,
    progressKey: progressRef,
    next,
    prev,
    goTo,
    pause,
    resume,
    stop,
  }
}
