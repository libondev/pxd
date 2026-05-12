import type { MessageItemConfig } from '../../../composables/use-message'

export function usePromiseMessage(setAutoCloseTimer: (message: MessageItemConfig) => void) {
  function resolvePromiseMessage<T>(
    handler: MessageItemConfig['success'],
    data: T,
  ): string | undefined {
    if (!handler) {
      return undefined
    }

    let result = handler

    if (typeof result === 'function') {
      result = result(data)
    }

    return typeof result === 'string' ? result : undefined
  }

  function handlePromiseMessage(message: MessageItemConfig) {
    if (!message.promise) {
      return
    }

    let promiseResult: unknown

    message.promise
      .then((data) => {
        promiseResult = data
        message.type = 'success'

        const successMessage = resolvePromiseMessage(message.success, data)
        if (successMessage) {
          message.message = successMessage
        }
      })
      .catch((err) => {
        promiseResult = err
        message.type = 'error'

        const errorMessage = resolvePromiseMessage(message.error, err)
        if (errorMessage) {
          message.message = errorMessage
        }
      })
      .finally(() => {
        const finallyMessage = resolvePromiseMessage(message.finally, promiseResult)
        if (finallyMessage) {
          message.message = finallyMessage
        }

        message.promise = undefined
        message.success = undefined
        message.error = undefined
        message.finally = undefined

        if (message.durations && message.durations > 0) {
          message._remainingMs = message.durations
          setAutoCloseTimer(message)
        }
      })
  }

  return {
    handlePromiseMessage,
  }
}
