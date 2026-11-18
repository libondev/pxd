import type { MaybeRefOrGetter, Ref } from 'vue'
import { onScopeDispose, shallowRef, toValue } from 'vue'
import { caf, off, on, raf } from '../utils/event.js'
import { isServer } from '../utils/is.js'

const DEFAULT_DURATION = 2000
// How far a hidden tab's timer steps, since it fires no animation frames.
const HIDDEN_TICK = 50

export type HoldStatus = 'idle' | 'loading' | 'confirmed' | 'canceled'

export interface HoldOptions {
  /** Hold duration in milliseconds. @default 2000 */
  duration?: MaybeRefOrGetter<number | undefined>
  /** @default true */
  enabled?: MaybeRefOrGetter<boolean | undefined>
  /** Called once the hold reaches the duration. */
  onConfirm?: () => void
  /** Called when the hold ends before it reaches the duration. */
  onCancel?: (progress: number) => void
}

interface Results {
  status: Readonly<Ref<HoldStatus>>
  progress: Readonly<Ref<number>>
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
}

export function useHold(options: HoldOptions = {}): Results {
  const status = shallowRef<HoldStatus>('idle')
  const progress = shallowRef(0)

  let frameId = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let held = 0
  let lastFrameAt = 0

  const isEnabled = () => toValue(options.enabled) ?? true

  function getDuration() {
    const duration = toValue(options.duration)

    return duration && duration > 0 ? duration : DEFAULT_DURATION
  }

  function stopProgress() {
    if (frameId) {
      caf(frameId)
      frameId = 0
    }

    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  // A hidden tab fires no animation frames, so the hold counts down on a timer there, and
  // finishes wherever it is running rather than waiting for the tab to be looked at again.
  function scheduleProgress() {
    if (!isServer() && document.hidden) {
      timer = setTimeout(updateProgress, HIDDEN_TICK)

      return
    }

    frameId = raf(updateProgress)
  }

  function startProgress() {
    lastFrameAt = Date.now()

    if (!frameId && !timer) {
      scheduleProgress()
    }
  }

  function updateProgress() {
    const now = Date.now()
    const duration = getDuration()

    frameId = 0
    timer = undefined
    held += now - lastFrameAt
    lastFrameAt = now

    if (held >= duration) {
      progress.value = 1
      status.value = 'confirmed'
      options.onConfirm?.()

      return
    }

    progress.value = held / duration
    scheduleProgress()
  }

  function onVisibilityChange() {
    if (status.value !== 'loading') {
      return
    }

    stopProgress()
    scheduleProgress()
  }

  function start() {
    if (!isEnabled()) {
      return
    }

    held = 0
    progress.value = 0
    status.value = 'loading'
    startProgress()
  }

  function pause() {
    if (status.value !== 'loading') {
      return
    }

    stopProgress()
    status.value = 'canceled'
  }

  function resume() {
    if (status.value !== 'canceled') {
      return
    }

    status.value = 'loading'
    startProgress()
  }

  function stop() {
    const heldProgress = progress.value
    const wasActive = status.value !== 'idle'
    const confirmed = status.value === 'confirmed'

    stopProgress()
    held = 0
    progress.value = 0
    status.value = 'idle'

    if (wasActive && !confirmed) {
      options.onCancel?.(heldProgress)
    }
  }

  if (!isServer()) {
    on(document, 'visibilitychange', onVisibilityChange)
  }

  onScopeDispose(() => {
    stopProgress()

    if (!isServer()) {
      off(document, 'visibilitychange', onVisibilityChange)
    }
  })

  return { status, progress, start, pause, resume, stop }
}
