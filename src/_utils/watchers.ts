import { onBeforeUnmount, watch } from 'vue'

type Watcher<T> = (value: T) => void

export function createWatchers<W> (watchSource: () => W): Set<Watcher<W>> {
  const watchersSet = new Set<Watcher<W>>([])

  const cleanWatchFn = watch(
    watchSource,
    (value) => watchersSet.forEach(fn => fn(value)),
    { flush: 'post' }
  )

  onBeforeUnmount(cleanWatchFn)

  return watchersSet
}
