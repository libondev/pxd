import type { VNode } from 'vue'
import type { ComponentClass } from '../types/shared/props'
import { isServer } from '../utils/is'

type MessageContent = string | VNode
type PromiseMessageHandler = MessageContent | ((data: unknown) => MessageContent)

interface Options {
  id?: string | number
  type?: 'info' | 'success' | 'warning' | 'error' | 'loading' | '' | false | undefined
  class?: ComponentClass
  group?: string
  promise?: Promise<unknown>
  durations?: number
  closeable?: boolean
  success?: PromiseMessageHandler
  error?: PromiseMessageHandler
  finally?: PromiseMessageHandler
}

type RequireAllExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>
type PromiseOptionKeys = 'type' | 'promise' | 'success' | 'error' | 'finally'
type RequiredOptionsExceptType = RequireAllExcept<Options, PromiseOptionKeys>

export interface MessageItemType extends RequiredOptionsExceptType {
  message: string | VNode
  _timerId?: ReturnType<typeof setTimeout>
  _remainingMs?: number
  _startedAtMs?: number
}

export interface MessageItemHeightType {
  id: MessageItemType['id']
  height: number
}

interface UseMessage {
  (msg: MessageContent, options?: Options): void
  info: (msg: MessageContent, options?: Options) => void
  success: (msg: MessageContent, options?: Options) => void
  warning: (msg: MessageContent, options?: Options) => void
  error: (msg: MessageContent, options?: Options) => void
  loading: (msg: MessageContent, options?: Options) => void
}

export const CLEAR_MESSAGES_EVENT_NAME = '#clear-messages'
export const CREATE_MESSAGE_EVENT_NAME = '#create-message'
export const REMOVE_MESSAGE_EVENT_NAME = '#remove-message'

export const useMessage = ((msg: MessageContent, options?: Options) => {
  if (isServer()) {
    return
  }

  options ??= {} as Options

  const message: MessageItemType = {
    ...options,
    id: options.id ?? Math.random(),
    message: msg,
    class: options.class ?? '',
    group: options.group ?? 'default',
    durations: options.durations ?? 3000,
    closeable: options.closeable ?? false,
  }

  window.dispatchEvent(
    new CustomEvent(CREATE_MESSAGE_EVENT_NAME, { detail: message }),
  )
}) as UseMessage

const shortcutTypes = ['info', 'error', 'loading', 'warning', 'success'] as const

shortcutTypes.forEach((type) => {
  useMessage[type] = (msg: MessageContent, options?: Options) => {
    useMessage(msg, { ...(options ?? {}), type })
  }
})

export function closeMessage(group: Options['group'], id: Options['id']) {
  if (!id) {
    return
  }

  window.dispatchEvent(
    new CustomEvent(REMOVE_MESSAGE_EVENT_NAME, {
      detail: { group: group ?? 'default', id },
    }),
  )
}

export function clearMessage(group: Options['group']) {
  window.dispatchEvent(
    new CustomEvent(CLEAR_MESSAGES_EVENT_NAME, {
      detail: { group: group ?? 'default' },
    }),
  )
}
