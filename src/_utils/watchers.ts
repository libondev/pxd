import { onBeforeUnmount, watch } from 'vue'

type Watcher<T> = (value: T, oldValue?: T | undefined) => void

interface WatcherOptions<W> {
  deep?: boolean
  immediate?: boolean
  initialValue?: Array<Watcher<W>>
}

export function createWatchers<W> (
  watchSource: () => W,
  { immediate, deep, initialValue = [] }: WatcherOptions<W> = {}
): Set<Watcher<W>> {
  const watchersSet = new Set<Watcher<W>>(initialValue)

  const cleanWatchFn = watch(
    watchSource,
    (value) => watchersSet.forEach(fn => fn(value)),
    { flush: 'post', immediate, deep }
  )

  onBeforeUnmount(cleanWatchFn)

  return watchersSet
}
