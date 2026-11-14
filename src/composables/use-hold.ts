import type { MaybeRefOrGetter, Ref } from 'vue'
import { onScopeDispose, shallowRef, toValue } from 'vue'
import { caf, raf } from '../utils/event.js'

const DEFAULT_DURATION = 2000

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
  let held = 0
  let lastFrameAt = 0

  const isEnabled = () => toValue(options.enabled) ?? true

  function getDuration() {
    const duration = toValue(options.duration)

    return duration && duration > 0 ? duration : DEFAULT_DURATION
  }

  function stopProgress() {
    if (!frameId) {
      return
    }

    caf(frameId)
    frameId = 0
  }

  function startProgress() {
    lastFrameAt = Date.now()

    if (!frameId) {
      frameId = raf(updateProgress)
    }
  }

  function updateProgress() {
    const now = Date.now()
    const duration = getDuration()

    frameId = 0
    held += now - lastFrameAt
    lastFrameAt = now

    if (held >= duration) {
      progress.value = 1
      status.value = 'confirmed'
      options.onConfirm?.()

      return
    }

    progress.value = held / duration
    frameId = raf(updateProgress)
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

  onScopeDispose(stopProgress)

  return { status, progress, start, pause, resume, stop }
}
