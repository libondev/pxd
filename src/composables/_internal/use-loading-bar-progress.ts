import type { MaybeRefOrGetter, Ref } from 'vue'
import { onScopeDispose, shallowRef, toValue } from 'vue'
import { caf, raf } from '../../utils/event.js'
import { clampValue } from '../../utils/format.js'

const ENABLE_TRANSITION_DELAY = 0
const DEFAULT_HIDE_DELAY = 500
const DEFAULT_TRICKLE_THRESHOLD = 200
const DEFAULT_MINIMUM = 0.08
const MAX_TRICKLE_PROGRESS = 0.994

export type LoadingBarProgressStatus = 'running' | 'finish' | 'error'

export interface LoadingBarProgressOptions {
  minimum?: MaybeRefOrGetter<number | undefined>
  trickle?: MaybeRefOrGetter<boolean | undefined>
  trickleThreshold?: MaybeRefOrGetter<number | undefined>
  hideDelay?: MaybeRefOrGetter<number | undefined>
}

interface Results {
  status: Readonly<Ref<LoadingBarProgressStatus>>
  hidden: Readonly<Ref<boolean>>
  progress: Readonly<Ref<number>>
  enableTransition: Readonly<Ref<boolean>>
  start: () => void
  finish: () => void
  error: () => void
  increase: (value?: number) => void
  stop: () => void
}

export function useLoadingBarProgress(options: LoadingBarProgressOptions = {}): Results {
  const status = shallowRef<LoadingBarProgressStatus>('finish')
  const hidden = shallowRef(false)
  const progress = shallowRef(0)
  const enableTransition = shallowRef(false)

  let prevTimestamp = 0
  let animationId = 0
  let hiddenTimer: ReturnType<typeof setTimeout> | undefined
  let transitionTimer: ReturnType<typeof setTimeout> | undefined

  function isTrickling() {
    return toValue(options.trickle) ?? true
  }

  function getIncreaseDelta(value: number) {
    if (value >= 0 && value < 0.2) {
      return 0.1
    }

    if (value >= 0.2 && value < 0.5) {
      return 0.04
    }

    if (value >= 0.5 && value < 0.8) {
      return 0.02
    }

    if (value >= 0.8 && value < 0.98) {
      return 0.005
    }

    return 0
  }

  function increase(value?: number) {
    if (progress.value >= 1) {
      caf(animationId)
      animationId = 0

      return
    }

    const now = performance.now()
    const delta = now - prevTimestamp
    const threshold = toValue(options.trickleThreshold) || DEFAULT_TRICKLE_THRESHOLD

    if (delta < threshold && isTrickling()) {
      animationId = raf(() => increase())

      return
    }

    prevTimestamp = now
    const amount = value || getIncreaseDelta(progress.value)
    progress.value = clampValue(progress.value + amount, 0, MAX_TRICKLE_PROGRESS)

    if (amount === 0 || !isTrickling()) {
      return
    }

    animationId = raf(() => increase())
  }

  function scheduleHide() {
    clearTimeout(hiddenTimer)
    hiddenTimer = setTimeout(
      () => {
        hidden.value = true
      },
      toValue(options.hideDelay) ?? DEFAULT_HIDE_DELAY,
    )
  }

  function start() {
    if (status.value === 'running') {
      return
    }

    enableTransition.value = false
    hidden.value = false
    status.value = 'running'
    progress.value = toValue(options.minimum) ?? DEFAULT_MINIMUM

    clearTimeout(hiddenTimer)
    clearTimeout(transitionTimer)
    transitionTimer = setTimeout(() => {
      enableTransition.value = true
    }, ENABLE_TRANSITION_DELAY)

    if (!isTrickling()) {
      return
    }

    prevTimestamp = 0
    animationId = raf(() => increase())
  }

  function finish() {
    if (status.value !== 'running') {
      return
    }

    caf(animationId)
    status.value = 'finish'
    hidden.value = false
    progress.value = 1
    scheduleHide()
  }

  function error() {
    if (status.value !== 'running') {
      return
    }

    caf(animationId)
    status.value = 'error'
    hidden.value = false
    progress.value = 1
    scheduleHide()
  }

  function stop() {
    caf(animationId)
    clearTimeout(hiddenTimer)
    clearTimeout(transitionTimer)
  }

  onScopeDispose(stop)

  return { status, hidden, progress, enableTransition, start, finish, error, increase, stop }
}
