import type { MessageItemConfig } from '../../../composables/use-message'

export function useMessageTimer(onTimeout: (id: MessageItemConfig['id']) => void) {
  function setAutoCloseTimer(message: MessageItemConfig) {
    message._startedAtMs = Date.now()

    if (message._remainingMs == null) {
      message._remainingMs = message.durations
    }

    if (message._timerId) {
      clearTimeout(message._timerId)
    }

    message._timerId = setTimeout(() => {
      onTimeout(message.id)
    }, message._remainingMs)
  }

  function pauseMessage(message: MessageItemConfig) {
    if (!message.durations || message.durations <= 0) {
      return
    }

    if (message._timerId) {
      clearTimeout(message._timerId)
      message._timerId = undefined
    }

    if (message._startedAtMs != null) {
      const elapsed = Date.now() - message._startedAtMs
      const previousRemaining = message._remainingMs ?? message.durations
      message._remainingMs = Math.max(0, previousRemaining - elapsed)
    }
  }

  function resumeMessage(message: MessageItemConfig) {
    if (!message.durations || message.durations <= 0) {
      return
    }

    const remaining = message._remainingMs ?? 0
    // if remaining time is very short,
    // close directly to reduce one short timer scheduling
    if (remaining <= 100) {
      onTimeout(message.id)
      return
    }

    setAutoCloseTimer(message)
  }

  function clearTimers(messages: MessageItemConfig[]) {
    messages.forEach((m) => {
      if (m._timerId) {
        clearTimeout(m._timerId)
        m._timerId = undefined
      }
    })
  }

  function pauseAll(messages: MessageItemConfig[]) {
    messages.forEach(pauseMessage)
  }

  function resumeAll(messages: MessageItemConfig[]) {
    messages.forEach(resumeMessage)
  }

  return {
    setAutoCloseTimer,
    pauseMessage,
    resumeMessage,
    clearTimers,
    pauseAll,
    resumeAll,
  }
}
