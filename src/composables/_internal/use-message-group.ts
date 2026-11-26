import type { MessageItemConfig } from '../use-message.js'
import type { MaybeRefOrGetter } from 'vue'
import { shallowRef, watchEffect, toValue } from 'vue'
import { withResolvers } from '../../utils/_internal/promise.js'
import { isNil } from '../../utils/is.js'

const TRANSITION_LOCK_MS = 250
const LEAVE_DEBOUNCE_MS = 200
const NEARLY_EXPIRED_MS = 100

interface UseMessageGroupOptions {
  messages: MaybeRefOrGetter<MessageItemConfig[]>
  expand: MaybeRefOrGetter<boolean | undefined>
  onTimeout: (id: MessageItemConfig['id']) => void
}

type MessageHandler = MessageItemConfig['success']

export function useMessageGroup({ messages, expand, onTimeout }: UseMessageGroupOptions) {
  const groupExpand = shallowRef(toValue(expand))

  let leaveTimeoutId: ReturnType<typeof setTimeout> | undefined
  let isTransitioning = false
  const pendingDisposers = new Set<() => void>()

  function dispose() {
    clearTimeout(leaveTimeoutId)

    for (const resolve of pendingDisposers) {
      resolve()
    }

    pendingDisposers.clear()
  }

  function lockTransition() {
    isTransitioning = true

    setTimeout(() => {
      isTransitioning = false
    }, TRANSITION_LOCK_MS)
  }

  function onPointerEnter() {
    clearTimeout(leaveTimeoutId)

    if (groupExpand.value || isTransitioning) {
      return
    }

    lockTransition()
    groupExpand.value = true
    pauseAll()
  }

  function onPointerLeave() {
    clearTimeout(leaveTimeoutId)

    if (isTransitioning) {
      return
    }

    leaveTimeoutId = setTimeout(() => {
      resumeAll()

      if (toValue(expand)) {
        return
      }

      groupExpand.value = false
      lockTransition()
    }, LEAVE_DEBOUNCE_MS)
  }

  function collapse() {
    groupExpand.value = false
  }

  function clearTimer(message: MessageItemConfig) {
    if (message._timerId) {
      clearTimeout(message._timerId)
      message._timerId = undefined
    }
  }

  function startTimer(message: MessageItemConfig) {
    message._startedAtMs = Date.now()

    if (isNil(message._remainingMs)) {
      message._remainingMs = message.duration
    }

    clearTimer(message)

    message._timerId = setTimeout(() => {
      onTimeout(message.id)
    }, message._remainingMs)
  }

  function pauseMessage(message: MessageItemConfig) {
    if (!message.duration || message.duration <= 0) {
      return
    }

    // no running timer means it never started or is already paused
    if (!message._timerId) {
      return
    }

    clearTimer(message)

    const elapsed = Date.now() - message._startedAtMs!
    const remaining = message._remainingMs ?? message.duration
    message._remainingMs = Math.max(0, remaining - elapsed)
  }

  function resumeMessage(message: MessageItemConfig) {
    if (!message.duration || message.duration <= 0) {
      return
    }

    // never started, e.g. a loading message still waiting for its promise
    if (message._startedAtMs == null) {
      return
    }

    // close directly when nearly expired, saving one short timer scheduling
    if ((message._remainingMs ?? 0) <= NEARLY_EXPIRED_MS) {
      onTimeout(message.id)
      return
    }

    startTimer(message)
  }

  function applyHandlerMessage(message: MessageItemConfig, handler: MessageHandler, data: unknown) {
    const content = typeof handler === 'function' ? handler(data) : handler

    if (!isNil(content)) {
      message.message = content
    }
  }

  async function handlePromiseMessage(message: MessageItemConfig) {
    const promise = message.promise

    if (!promise) {
      return
    }

    // Each message owns its own cancellation promise. A single shared promise would accumulate
    // one reaction per loading message for the whole lifetime of the group.
    const { promise: disposed, resolve: resolveDispose } = withResolvers<void>()

    pendingDisposers.add(resolveDispose)

    try {
      const outcome = await Promise.race([
        Promise.resolve(promise).then(
          (value) => ({ status: 'fulfilled' as const, value }),
          (reason) => ({ status: 'rejected' as const, reason }),
        ),
        disposed.then(() => ({ status: 'disposed' as const })),
      ])

      if (outcome.status === 'disposed') {
        return
      }

      let result: unknown

      try {
        if (outcome.status === 'rejected') {
          throw outcome.reason
        }

        result = outcome.value
        message.type = 'success'
        applyHandlerMessage(message, message.success, result)
      } catch (err) {
        result = err
        message.type = 'error'
        applyHandlerMessage(message, message.error, err)
      } finally {
        applyHandlerMessage(message, message.finally, result)

        message.promise = undefined
        message.success = undefined
        message.error = undefined
        message.finally = undefined

        // it may have been closed or cleared while the promise was pending
        const isAlive = toValue(messages).includes(message)

        if (isAlive && message.duration && message.duration > 0) {
          message._remainingMs = message.duration
          startTimer(message)
        }
      }
    } finally {
      pendingDisposers.delete(resolveDispose)
      resolveDispose()
    }
  }

  function clearTimers() {
    toValue(messages).forEach(clearTimer)
  }

  function pauseAll() {
    toValue(messages).forEach(pauseMessage)
  }

  function resumeAll() {
    // resumeMessage may close a message synchronously, so iterate over a snapshot
    const snapshot = [...toValue(messages)]

    snapshot.forEach(resumeMessage)
  }

  watchEffect(() => {
    groupExpand.value = toValue(expand)
  })

  return {
    groupExpand,
    collapse,
    onPointerEnter,
    onPointerLeave,
    startTimer,
    clearTimer,
    clearTimers,
    pauseMessage,
    resumeMessage,
    pauseAll,
    resumeAll,
    handlePromiseMessage,
    dispose,
  }
}
