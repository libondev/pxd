import type { VNode } from 'vue'
import type { ComponentClass } from '../types/shared/props'
import { isServer } from '../utils/is'
import { getUniqueId } from '../utils/uid'

interface Options {
  key?: string
  type?: 'info' | 'success' | 'warning' | 'error' | 'loading' | '' | false | undefined
  class?: ComponentClass
  group?: string
  durations?: number
  closeable?: boolean
}

type RequireAllExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>
type RequiredOptionsExceptType = RequireAllExcept<Options, 'type'>

export interface MessageItem extends RequiredOptionsExceptType {
  message: string | VNode
  _timerId?: ReturnType<typeof setTimeout>
  _remainingMs?: number
  _startedAtMs?: number
}

interface UseMessage {
  (msg: string | VNode, options?: Options): void
  info: (msg: string | VNode, options?: Options) => void
  success: (msg: string | VNode, options?: Options) => void
  warning: (msg: string | VNode, options?: Options) => void
  error: (msg: string | VNode, options?: Options) => void
  loading: (msg: string | VNode, options?: Options) => void
}

export const CREATE_MESSAGE_EVENT_NAME = '#create-message'
export const REMOVE_MESSAGE_EVENT_NAME = '#remove-message'

export const useMessage = ((msg: string | VNode, options?: Options) => {
  if (isServer) {
    return
  }

  options ??= {} as Options

  const message: MessageItem = {
    key: options.key || getUniqueId(),
    message: msg,
    type: options.type,
    class: options.class ?? '',
    group: options.group || 'default',
    durations: options.durations ?? 3000,
    closeable: options.closeable ?? false,
  }

  window.dispatchEvent(
    new CustomEvent(CREATE_MESSAGE_EVENT_NAME, { detail: message }),
  )
}) as UseMessage

const shortcutTypes = ['info', 'error', 'loading', 'warning', 'success'] as const

shortcutTypes.forEach((type) => {
  useMessage[type] = (msg: string | VNode, options?: Options) => {
    useMessage(msg, { ...(options ?? {}), type })
  }
})
